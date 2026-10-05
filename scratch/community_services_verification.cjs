const http = require('http');

const API_BASE = 'http://localhost:4000/api';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(`${API_BASE}/auth/login`, { method: 'POST' }, { email, password });
  if (res.status !== 200 || !res.data.data?.token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return res.data.data.token;
}

async function runTests() {
  console.log('=== STARTING COMMUNITY SERVICES VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Tenant (Preetham)
    console.log('[1] Authenticating preetham@community.local...');
    const tenantToken = await login('preetham@community.local', 'Tenant1@12345');
    const tenantHeaders = { Authorization: `Bearer ${tenantToken}` };
    assert(!!tenantToken, 'Tenant authenticated successfully');

    // 2. Authenticate Owner (Vikramaditya)
    console.log('[2] Authenticating vikramaditya@community.local...');
    const ownerToken = await login('vikramaditya@community.local', 'Owner@12345');
    const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };
    assert(!!ownerToken, 'Owner authenticated successfully');

    // 3. Test Amenities Listing
    console.log('\n[3] Testing Amenities Listing...');
    const amenitiesRes = await request(`${API_BASE}/amenities`, { headers: tenantHeaders });
    assert(amenitiesRes.status === 200, 'GET /amenities returned 200');
    assert(Array.isArray(amenitiesRes.data.data) && amenitiesRes.data.data.length > 0, `Found ${amenitiesRes.data.data?.length} amenities`);
    const targetAmenity = amenitiesRes.data.data[0];
    const targetAmenityId = targetAmenity.id;
    console.log(`   Selected amenity: ${targetAmenity.name} (${targetAmenityId})`);

    // 4. Test Amenity Schedule
    console.log('\n[4] Testing Amenity Schedule...');
    const scheduleRes = await request(`${API_BASE}/amenities/${targetAmenityId}/bookings`, { headers: tenantHeaders });
    assert(scheduleRes.status === 200, `GET /amenities/${targetAmenityId}/bookings returned 200`);
    assert(Array.isArray(scheduleRes.data.data), 'Schedule returns bookings array');

    // 5. Test Amenity Booking (Valid Slot in the Future)
    console.log('\n[5] Testing Amenity Booking Slot Creation...');
    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days from now
    const year = futureDate.getUTCFullYear();
    const month = String(futureDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const startTime = `${dateStr}T10:00:00.000Z`;
    const endTime = `${dateStr}T12:00:00.000Z`;

    const bookingRes = await request(`${API_BASE}/amenities/${targetAmenityId}/book`, {
      method: 'POST',
      headers: tenantHeaders
    }, {
      startTime,
      endTime,
      notes: 'Tenant Community Verification Booking'
    });

    assert(bookingRes.status === 201 || bookingRes.status === 200, `Book slot returned status ${bookingRes.status}`);
    const booking = bookingRes.data.data;
    assert(booking && booking.id, `Booking created with id: ${booking?.id}`);

    // 6. Test Conflict Prevention (Attempt double booking the exact same slot)
    console.log('\n[6] Testing Conflict Prevention (Overlapping Booking)...');
    const conflictRes = await request(`${API_BASE}/amenities/${targetAmenityId}/book`, {
      method: 'POST',
      headers: ownerHeaders // different user trying to book same slot
    }, {
      startTime,
      endTime,
      notes: 'Conflicting Booking Attempt'
    });
    assert(conflictRes.status === 400, `Conflicting booking rejected with 400 (Status: ${conflictRes.status})`);
    const conflictMsg = conflictRes.data.error?.message || conflictRes.data.message || '';
    assert(conflictMsg.toLowerCase().includes('already reserved') || conflictMsg.toLowerCase().includes('already booked') || conflictMsg.toLowerCase().includes('conflict'), `Error message indicates conflict: "${conflictMsg}"`);

    // 7. Test Resident Bookings Listing
    console.log('\n[7] Testing Resident Bookings Listing...');
    const myBookingsRes = await request(`${API_BASE}/amenity-bookings`, { headers: tenantHeaders });
    assert(myBookingsRes.status === 200, 'GET /amenity-bookings returned 200');
    const residentBookings = myBookingsRes.data.data || [];
    const foundBooking = residentBookings.find(b => b.id === booking.id);
    assert(!!foundBooking, 'Created booking found in resident bookings list');

    // 8. Test Amenity Booking Cancellation
    if (booking?.id) {
      console.log('\n[8] Testing Booking Cancellation...');
      const cancelRes = await request(`${API_BASE}/amenity-bookings/${booking.id}/cancel`, {
        method: 'PATCH',
        headers: tenantHeaders
      });
      assert(cancelRes.status === 200, `Booking cancelled successfully with status ${cancelRes.status}`);
      assert(cancelRes.data.data?.status === 'CANCELLED', 'Booking status updated to CANCELLED');

      // Now verify slot is released and re-bookable!
      console.log('\n[8b] Testing Slot Re-booking after cancellation...');
      const rebookRes = await request(`${API_BASE}/amenities/${targetAmenityId}/book`, {
        method: 'POST',
        headers: ownerHeaders
      }, {
        startTime,
        endTime,
        notes: 'Owner Re-booking released slot'
      });
      assert(rebookRes.status === 201 || rebookRes.status === 200, `Released slot re-booked successfully with status ${rebookRes.status}`);

      // Clean up rebooking
      if (rebookRes.data.data?.id) {
        await request(`${API_BASE}/amenity-bookings/${rebookRes.data.data.id}/cancel`, {
          method: 'PATCH',
          headers: ownerHeaders
        });
      }
    }

    // 9. Test Residents Directory
    console.log('\n[9] Testing Residents Directory...');
    const dirRes = await request(`${API_BASE}/resident/directory`, { headers: tenantHeaders });
    assert(dirRes.status === 200, 'GET /resident/directory returned 200');
    assert(Array.isArray(dirRes.data.data), `Directory returned ${dirRes.data.data?.length} residents`);
    if (dirRes.data.data?.length > 0) {
      const entry = dirRes.data.data[0];
      assert(entry.unitNumber && entry.residentName, `Directory entry valid: ${entry.residentName} (${entry.unitNumber})`);
    }

    // 10. Test Lease & Tenancy Records
    console.log('\n[10] Testing Lease & Tenancy Records...');
    const leaseRes = await request(`${API_BASE}/resident/lease`, { headers: tenantHeaders });
    assert(leaseRes.status === 200, 'GET /resident/lease returned 200');
    assert(leaseRes.data.data && leaseRes.data.data.unitNumber, `Lease record returned for unit ${leaseRes.data.data?.unitNumber}`);
    assert(leaseRes.data.data?.leaseAgreementNumber, `Lease agreement number present: ${leaseRes.data.data?.leaseAgreementNumber}`);

    // 11. Test CCTV & Security Desk
    console.log('\n[11] Testing CCTV & Security Desk...');
    const secRes = await request(`${API_BASE}/resident/security`, { headers: tenantHeaders });
    assert(secRes.status === 200, 'GET /resident/security returned 200');
    assert(secRes.data.data?.gateStatus === 'OPERATIONAL', 'Gate status is OPERATIONAL');
    assert(Array.isArray(secRes.data.data?.checkpoints), `Returned ${secRes.data.data?.checkpoints?.length} security checkpoints`);
    assert(secRes.data.data?.emergencyHelplines?.gateIntercom, `Security gate intercom present: ${secRes.data.data?.emergencyHelplines?.gateIntercom}`);

    // 12. Test Notices & Circulars
    console.log('\n[12] Testing Notices & Circulars...');
    const noticeRes = await request(`${API_BASE}/resident/notices`, { headers: tenantHeaders });
    assert(noticeRes.status === 200, 'GET /resident/notices returned 200');
    assert(Array.isArray(noticeRes.data.data), `Returned ${noticeRes.data.data?.length} community notices`);

    // 13. Test Existing Resident Services APIs
    console.log('\n[13] Testing Existing Resident Services APIs...');
    const householdRes = await request(`${API_BASE}/resident/household`, { headers: tenantHeaders });
    assert(householdRes.status === 200, 'GET /resident/household returned 200');

    const vehiclesRes = await request(`${API_BASE}/resident/vehicles`, { headers: tenantHeaders });
    assert(vehiclesRes.status === 200, 'GET /resident/vehicles returned 200');

    const parkingRes = await request(`${API_BASE}/resident/parking`, { headers: tenantHeaders });
    assert(parkingRes.status === 200, 'GET /resident/parking returned 200');

    const docsRes = await request(`${API_BASE}/documents`, { headers: tenantHeaders });
    assert(docsRes.status === 200, 'GET /documents returned 200');

    const paymentsRes = await request(`${API_BASE}/dues`, { headers: tenantHeaders });
    assert(paymentsRes.status === 200, 'GET /dues returned 200');

    const passesRes = await request(`${API_BASE}/visitors`, { headers: tenantHeaders });
    assert(passesRes.status === 200, 'GET /visitors returned 200');

    const ticketsRes = await request(`${API_BASE}/maintenance`, { headers: tenantHeaders });
    assert(ticketsRes.status === 200, 'GET /maintenance returned 200');

    // 14. Test Owner Access
    console.log('\n[14] Testing Owner Access to Community Services...');
    const ownerDirRes = await request(`${API_BASE}/resident/directory`, { headers: ownerHeaders });
    assert(ownerDirRes.status === 200, 'Owner can access directory (200)');
    const ownerNoticesRes = await request(`${API_BASE}/resident/notices`, { headers: ownerHeaders });
    assert(ownerNoticesRes.status === 200, 'Owner can access notices (200)');
    const ownerLeaseRes = await request(`${API_BASE}/resident/lease`, { headers: ownerHeaders });
    assert(ownerLeaseRes.status === 200, 'Owner can access ownership/unit record (200)');

  } catch (err) {
    console.error('UNEXPECTED EXCEPTION:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
