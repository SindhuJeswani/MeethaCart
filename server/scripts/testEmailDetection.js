import http from 'http';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testEmailDetection() {
  console.log('======================================================');
  console.log('TESTING EMAIL DETECTION & VALIDATION WORKFLOW');
  console.log('======================================================\n');

  // --- PART 1: SIGN-UP ---
  console.log('--- PART 1: SIGN-UP VALIDATIONS ---');

  // 1. Invalid format (abc@, abc.com)
  const t1a = await request('POST', '/api/auth/register', { name: 'Test', email: 'abc@', password: 'Password123!', role: 'buyer' });
  console.log('1a. Invalid format (abc@):', t1a.status, 'Message:', t1a.body.message);

  const t1b = await request('POST', '/api/auth/register', { name: 'Test', email: 'abc.com', password: 'Password123!', role: 'buyer' });
  console.log('1b. Invalid format (abc.com):', t1b.status, 'Message:', t1b.body.message);

  // 2. Typo domain (name@gmial.com)
  const t2 = await request('POST', '/api/auth/register', { name: 'Test', email: 'ayesha@gmial.com', password: 'Password123!', role: 'buyer' });
  console.log('2. Typo domain (gmial.com):', t2.status, 'Message:', t2.body.message);

  // 3. Non-existent domain (test@thisdomaindoesnotexist12345.com)
  const t3 = await request('POST', '/api/auth/register', { name: 'Test', email: 'test@thisdomaindoesnotexist12345.com', password: 'Password123!', role: 'buyer' });
  console.log('3. Non-existent domain:', t3.status, 'Message:', t3.body.message);

  // 4. Disposable domain (test@mailinator.com)
  const t4 = await request('POST', '/api/auth/register', { name: 'Test', email: 'test@mailinator.com', password: 'Password123!', role: 'buyer' });
  console.log('4. Disposable domain:', t4.status, 'Message:', t4.body.message);

  // 5. Already registered email (sara.ahmed@meethacart.pk)
  const t5 = await request('POST', '/api/auth/register', { name: 'Sara Dup', email: 'sara.ahmed@meethacart.pk', password: 'Password123!', role: 'buyer' });
  console.log('5. Already registered email:', t5.status, 'Message:', t5.body.message);

  // 6. Valid real email (fresh Gmail address)
  const validEmail = `valid.test.${Date.now()}@gmail.com`;
  const t6 = await request('POST', '/api/auth/register', { name: 'Valid User', email: validEmail, password: 'Password123!', role: 'buyer' });
  console.log('6. Valid real email:', t6.status, 'DevOTP sent:', Boolean(t6.body.devOtp), 'Message:', t6.body.message);


  // --- PART 2: FORGOT / RESET PASSWORD ---
  console.log('\n--- PART 2: FORGOT PASSWORD VALIDATIONS ---');

  // 2a. Unregistered email
  const f1 = await request('POST', '/api/auth/forgot-password', { email: 'unregistered.user.999@gmail.com' });
  console.log('2a. Forgot pw unregistered email:', f1.status, 'Message:', f1.body.message);

  // 2b. Registered buyer
  const f2 = await request('POST', '/api/auth/forgot-password', { email: 'sara.ahmed@meethacart.pk' });
  console.log('2b. Forgot pw registered buyer:', f2.status, 'DevOTP sent:', Boolean(f2.body.devOtp));

  // 2c. Registered seller
  const f3 = await request('POST', '/api/auth/forgot-password', { email: 'fatima.bakes@meethacart.pk' });
  console.log('2c. Forgot pw registered seller:', f3.status, 'DevOTP sent:', Boolean(f3.body.devOtp));

  // 2d. Registered admin
  const f4 = await request('POST', '/api/auth/forgot-password', { email: 'bcsbs2212326@szabist.pk' });
  console.log('2d. Forgot pw registered admin:', f4.status, 'DevOTP sent:', Boolean(f4.body.devOtp));


  // --- PART 3: SIGN-IN ---
  console.log('\n--- PART 3: SIGN-IN VALIDATIONS ---');

  // 3a. Unregistered email
  const l1 = await request('POST', '/api/auth/login', { email: 'nobody.registered@gmail.com', password: 'Password123!' });
  console.log('3a. Sign-in unregistered email:', l1.status, 'Message:', l1.body.message);

  // 3b. Registered email with wrong password
  const l2 = await request('POST', '/api/auth/login', { email: 'sara.ahmed@meethacart.pk', password: 'WrongPassword999!' });
  console.log('3b. Sign-in wrong password:', l2.status, 'Message:', l2.body.message);

  // 3c. Correct credentials (works with NO OTP)
  const l3 = await request('POST', '/api/auth/login', { email: 'sara.ahmed@meethacart.pk', password: 'Password123!' });
  console.log('3c. Sign-in correct credentials:', l3.status, 'Has token:', Boolean(l3.body.token), 'Role:', l3.body.user?.role);


  // --- PART 4: CLEANUP & DB LEFTOVER CHECK ---
  console.log('\n--- PART 4: DATABASE CHECK ---');
  const { User } = await import('../models/User.js');
  const { Otp } = await import('../models/Otp.js');
  const { connectDB } = await import('../config/db.js');
  await connectDB();

  // Check if any invalid email created a record
  const badEmails = ['abc@', 'abc.com', 'ayesha@gmial.com', 'test@thisdomaindoesnotexist12345.com', 'test@mailinator.com'];
  const leftovers = await User.countDocuments({ email: { $in: badEmails } });
  console.log('Leftover users from failed sign-up attempts in DB:', leftovers, '(Expected: 0)');

  // Clean valid test email
  await User.deleteMany({ email: validEmail });
  await Otp.deleteMany({ email: validEmail });
  console.log('✓ Cleaned test records.');

  console.log('\n======================================================');
  console.log('ALL EMAIL DETECTION & AUTH TESTS COMPLETED');
  console.log('======================================================');
  process.exit(0);
}

testEmailDetection().catch(err => {
  console.error('[Test Error]:', err);
  process.exit(1);
});

