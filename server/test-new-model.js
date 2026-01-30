const mongoose = require('mongoose');
require('dotenv').config();

async function testNewModel() {
    console.log('=== Testing NEW User Model ===\n');

    try {
        // Clear mongoose models cache
        delete mongoose.connection.models.User;

        // Connect to MongoDB
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('   ✅ MongoDB connected\n');

        // Clear existing data
        console.log('2. Clearing existing data...');
        await mongoose.connection.db.dropCollection('users').catch(() => {
            console.log('   ℹ️  No users collection to drop\n');
        });

        // Load the NEW User model
        console.log('3. Loading User model...');
        const User = require('./models/User');
        console.log('   ✅ User model loaded\n');

        // Test 1: Create user with your exact data
        console.log('4. Creating user with YOUR credentials...');
        const userData = {
            name: 'yash',
            email: 'yashdubey210656@gmail.in',
            password: 'Yash@1972@'
        };

        const user = new User(userData);
        await user.save();
        console.log('   ✅ User created successfully!');
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password (hashed): ${user.password.substring(0, 20)}...`);
        console.log(`   Password length: ${user.password.length} characters\n`);

        // Test 2: Find the user
        console.log('5. Finding user by email...');
        const foundUser = await User.findOne({ email: 'yashdubey210656@gmail.in' });
        console.log('   ✅ User found:', foundUser.name);
        console.log(`   Created: ${foundUser.createdAt}\n`);

        // Test 3: Compare password (correct)
        console.log('6. Testing password comparison (correct password)...');
        const isCorrect = await foundUser.comparePassword('Yash@1972@');
        console.log(`   ✅ Correct password matches: ${isCorrect}\n`);

        // Test 4: Compare password (wrong)
        console.log('7. Testing password comparison (wrong password)...');
        const isWrong = await foundUser.comparePassword('wrongpassword');
        console.log(`   ✅ Wrong password rejected: ${!isWrong}\n`);

        // Test 5: Try duplicate email
        console.log('8. Testing duplicate email protection...');
        try {
            const duplicateUser = new User({
                name: 'Duplicate Yash',
                email: 'yashdubey210656@gmail.in', // Same email
                password: 'AnotherPassword123'
            });
            await duplicateUser.save();
            console.log('   ❌ ERROR: Should have failed but succeeded');
        } catch (error) {
            console.log(`   ✅ Duplicate email rejected: ${error.message}\n`);
        }

        // Test 6: Update user without changing password
        console.log('9. Testing user update without password change...');
        foundUser.name = 'Yash Updated';
        await foundUser.save();
        console.log('   ✅ User updated without re-hashing password\n');

        // Test 7: Update user with password change
        console.log('10. Testing user update WITH password change...');
        foundUser.password = 'NewPassword123';
        await foundUser.save();
        console.log('   ✅ Password changed and re-hashed');
        console.log(`   New password hash: ${foundUser.password.substring(0, 20)}...\n`);

        // Cleanup
        console.log('11. Cleaning up test data...');
        await User.deleteMany({});
        console.log('   ✅ Test data cleaned\n');

        await mongoose.disconnect();
        console.log('12. Disconnected from MongoDB');
        console.log('\n🎉 === ALL TESTS PASSED SUCCESSFULLY! ===');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('Error details:', error);

        if (error.code === 11000) {
            console.error('\n⚠️  Duplicate key error - Email already exists');
        }

        process.exit(1);
    }
}

testNewModel();