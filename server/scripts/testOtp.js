import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { otpService } from '../services/otpService.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const runTests = async () => {
  console.log('\n🧪 ==============================================================');
  console.log('🧪 Starting MeethaCart M1 Security & OTP Automated Test Suite');
  console.log('🧪 ==============================================================\n');

  await connectDB();

  const testEmail = 'defense_tester@meethacart.com';
  const testPassword = 'Password123!';

  // Clean previous test artifacts
  await User.deleteMany({ email: testEmail });
  await Otp.deleteMany({ email: testEmail });

  try {
    // -------------------------------------------------------------
    // Test 1: User Registration & Hashed OTP Generation
    // -------------------------------------------------------------
    console.log('[TEST 1] Creating User & Generating OTP...');
    const user = await User.create({
      name: 'Defense Tester',
      email: testEmail,
      password: testPassword,
      role: 'seller',
      bakeryName: "Tester's Artisan Bakery",
      isVerified: false,
      sellerStatus: 'pending'
    });
    console.log('✓ User created with isVerified = false, sellerStatus = pending');

    const otpGen = await otpService.createAndSendOtp(testEmail, 'signup_verification');
    console.log(`✓ OTP dispatched. Cooldown: ${otpGen.cooldownSeconds}s`);

    const otpRecord = await Otp.findOne({ email: testEmail, purpose: 'signup_verification' });
    if (!otpRecord) throw new Error('OTP record was not saved to database!');

    // Security check: Verify OTP is NEVER stored in plain text
    const isPlainNumber = /^\d{6}$/.test(otpRecord.otpHash);
    if (isPlainNumber) {
      throw new Error('SECURITY VIOLATION: OTP was stored in plain text!');
    }
    console.log(`✓ Security verified: OTP is securely hashed in database (${otpRecord.otpHash.substring(0, 15)}...)`);

    // -------------------------------------------------------------
    // Test 2: 60-Second Resend Cooldown Enforcement
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing 60-Second Resend Cooldown...');
    try {
      await otpService.createAndSendOtp(testEmail, 'signup_verification');
      throw new Error('FAILED: Cooldown was bypassed!');
    } catch (err) {
      if (err.message.includes('seconds before requesting a new OTP')) {
        console.log(`✓ Passed: Cooldown enforced successfully. (${err.message})`);
      } else {
        throw err;
      }
    }

    // -------------------------------------------------------------
    // Test 3: Wrong OTP Attempts & 5-Strike Lockout
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Wrong OTP Attempts & 5-Strike Lockout...');
    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = await otpService.verifyOtp(testEmail, '000000', 'signup_verification');
      if (res.valid) throw new Error('Wrong OTP was incorrectly accepted!');
      console.log(`  - Attempt ${attempt}: Correctly rejected. (${res.message})`);
    }

    // 5th attempt should lock the OTP
    const fifthAttempt = await otpService.verifyOtp(testEmail, '000000', 'signup_verification');
    console.log(`  - Attempt 5: ${fifthAttempt.message}`);

    // Any subsequent attempt (even if correct) must be locked
    const lockedDoc = await Otp.findOne({ email: testEmail, purpose: 'signup_verification' });
    if (!lockedDoc.consumed) throw new Error('Failed: 5-strike OTP was not locked!');
    console.log('✓ Passed: 5-strike lock successfully disabled the compromised OTP record');

    // -------------------------------------------------------------
    // Test 4: Fresh OTP Verification & Account Activation
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Fresh OTP & Account Verification...');
    // Reset cooldown for test purpose
    await Otp.updateMany({ email: testEmail }, { $set: { resendAvailableAt: new Date(Date.now() - 1000) } });
    
    // Create new OTP
    await otpService.createAndSendOtp(testEmail, 'signup_verification');
    
    // Extract plain OTP by testing against all 6-digit combinations or generate deterministic OTP
    // Let's create a known OTP hash for testing
    const knownOtp = '742918';
    const testOtpDoc = await Otp.findOne({ email: testEmail, purpose: 'signup_verification', consumed: false });
    testOtpDoc.otpHash = await bcrypt.hash(knownOtp, 10);
    await testOtpDoc.save();

    const verifySuccess = await otpService.verifyOtp(testEmail, knownOtp, 'signup_verification');
    if (!verifySuccess.valid) throw new Error(`Valid OTP failed: ${verifySuccess.message}`);
    console.log('✓ Passed: Correct OTP accepted successfully!');

    // -------------------------------------------------------------
    // Test 5: Reused OTP Rejection (Single-Use Enforcement)
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Reused OTP Rejection...');
    const reuseAttempt = await otpService.verifyOtp(testEmail, knownOtp, 'signup_verification');
    if (reuseAttempt.valid) throw new Error('SECURITY VIOLATION: Reused OTP was accepted!');
    console.log(`✓ Passed: Reused OTP rejected successfully. (${reuseAttempt.message})`);

    // -------------------------------------------------------------
    // Test 6: Expired OTP Rejection
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Expired OTP Rejection...');
    const expiredOtp = '654321';
    await Otp.create({
      email: testEmail,
      otpHash: await bcrypt.hash(expiredOtp, 10),
      purpose: 'login_2fa',
      attempts: 0,
      expiresAt: new Date(Date.now() - 10000), // Expired 10 seconds ago
      resendAvailableAt: new Date(),
      consumed: false
    });

    const expiredResult = await otpService.verifyOtp(testEmail, expiredOtp, 'login_2fa');
    if (expiredResult.valid) throw new Error('SECURITY VIOLATION: Expired OTP was accepted!');
    console.log(`✓ Passed: Expired OTP rejected successfully. (${expiredResult.message})`);

    // Clean up test records
    await User.deleteMany({ email: testEmail });
    await Otp.deleteMany({ email: testEmail });

    console.log('\n🎉 ==============================================================');
    console.log('🎉 ALL M1 SECURITY & OTP TESTS PASSED 100% SUCCESSFULLY!');
    console.log('🎉 ==============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exit(1);
  }
};

runTests();
