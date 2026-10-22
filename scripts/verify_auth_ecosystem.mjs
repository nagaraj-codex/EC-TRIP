/**
 * Automated Verification Script for Connectly Authentication Ecosystem
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Connectly Authentication Ecosystem Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('1. Testing Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.ok && healthData.status === 'ok', 'Health Check endpoint returns status ok');

    // 2. Pre-seeded Demo Login
    console.log('\n2. Testing Pre-seeded Demo Account Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'alex.morgan@example.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.ok && loginData.success, 'Demo login with correct credentials succeeds');
    assert(loginData.user?.email === 'alex.morgan@example.com', 'Returns sanitized user without passwordHash');
    assert(!!loginData.accessToken, 'Returns JWT access token');

    // Extract auth cookie or token for protected tests
    const demoToken = loginData.accessToken;
    const cookieHeader = loginRes.headers.get('set-cookie') || '';

    // 3. Login with Invalid Credentials
    console.log('\n3. Testing Security: Generic Error on Invalid Credentials...');
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'nonexistent.user@example.com',
        password: 'WrongPassword!',
      }),
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401, 'Invalid login rejected with status 401');
    assert(
      badLoginData.error === 'Incorrect email, phone number or password.',
      'Returns generic error without revealing account existence'
    );

    // 4. Register New User
    console.log('\n4. Testing New User Registration...');
    const timestamp = Date.now();
    const testEmail = `user.${timestamp}@testconnectly.local`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Jordan',
        lastName: 'Taylor',
        emailOrPhone: testEmail,
        password: 'SecurePassword123!',
        dateOfBirth: '1998-04-12',
        gender: 'custom',
        pronoun: 'they',
        customGender: 'Non-binary',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success, 'New user registration succeeds');
    assert(regData.user?.gender === 'custom' && regData.user?.pronoun === 'they', 'Stores custom gender and pronoun');

    // 5. Age Validation in Registration (under 13 must fail)
    console.log('\n5. Testing Registration Age Validation (Under 13 restriction)...');
    const underAgeRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Child',
        lastName: 'User',
        emailOrPhone: `child.${timestamp}@testconnectly.local`,
        password: 'SecurePassword123!',
        dateOfBirth: '2020-01-01', // Age ~6
        gender: 'female',
      }),
    });
    assert(underAgeRes.status === 400, 'Registration for age < 13 is rejected with 400');

    // 6. Protected Session (/api/auth/me)
    console.log('\n6. Testing Protected Session Endpoint (/api/auth/me)...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${demoToken}`,
        Cookie: cookieHeader,
      },
    });
    const meData = await meRes.json();
    assert(meRes.ok && meData.success, 'Protected /me endpoint succeeds with valid token');
    assert(meData.user?.email === 'alex.morgan@example.com', 'Returns active user profile');
    assert(meData.sessionInfo?.totalActiveSessions >= 1, 'Returns active sessions count');

    // 7. Find Account (Account Recovery Step 1)
    console.log('\n7. Testing Account Recovery: Find Account...');
    const findRes = await fetch(`${BASE_URL}/auth/find-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testEmail }),
    });
    const findData = await findRes.json();
    assert(findRes.ok && findData.success, 'Account found by email');
    assert(findData.data?.name === 'Jordan Taylor', 'Returns correct display name');
    assert(findData.data?.maskedEmail.includes('*'), 'Email is properly masked for security');

    const targetUserId = findData.data.userId;

    // 8. Send OTP (Account Recovery Step 2)
    console.log('\n8. Testing Account Recovery: Send OTP...');
    const otpRes = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, method: 'email' }),
    });
    const otpData = await otpRes.json();
    assert(otpRes.ok && otpData.success, 'OTP code generated and sent');
    const receivedCode = otpData.data?.previewCode;
    assert(!!receivedCode && receivedCode.length === 6, `6-digit confirmation code generated: ${receivedCode}`);

    // 9. Verify OTP (Account Recovery Step 3)
    console.log('\n9. Testing Account Recovery: Verify OTP Code...');
    // Test invalid code first
    const badOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, code: '000000' }),
    });
    assert(badOtpRes.status === 400, 'Invalid OTP code properly rejected');

    // Verify with actual code
    const goodOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, code: receivedCode }),
    });
    const goodOtpData = await goodOtpRes.json();
    assert(goodOtpRes.ok && goodOtpData.success, 'Valid OTP code accepted');
    assert(!!goodOtpData.resetToken, 'Returns password reset token');

    const resetToken = goodOtpData.resetToken;

    // 10. Reset Password (Account Recovery Step 4)
    console.log('\n10. Testing Password Reset...');
    const newPassword = 'BrandNewPassword456!';
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetToken,
        newPassword,
        confirmPassword: newPassword,
      }),
    });
    const resetData = await resetRes.json();
    assert(resetRes.ok && resetData.success, 'Password changed successfully');

    // 11. Login with New Password
    console.log('\n11. Testing Login with New Password...');
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: newPassword,
      }),
    });
    const newLoginData = await newLoginRes.json();
    assert(newLoginRes.ok && newLoginData.success, 'Login with new password succeeds');

    // 12. Logout
    console.log('\n12. Testing Logout...');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newLoginData.accessToken}`,
      },
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.ok && logoutData.success, 'User successfully logged out');

    console.log(`\n========================================`);
    console.log(`🏁 Test Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Test suite encountered fatal error:', err);
    process.exit(1);
  }
}

runTests();
