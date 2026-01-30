// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Please add a name'],
//         trim: true,
//         minlength: [2, 'Name must be at least 2 characters'],
//         maxlength: [50, 'Name cannot exceed 50 characters']
//     },
//     email: {
//         type: String,
//         required: [true, 'Please add an email'],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [
//             /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//             'Please add a valid email'
//         ]
//     },
//     password: {
//         type: String,
//         required: [true, 'Please add a password'],
//         minlength: [6, 'Password must be at least 6 characters']
//     },
//     profilePic: {
//         type: String,
//         default: ''
//     },
//     bio: {
//         type: String,
//         default: '',
//         maxlength: [200, 'Bio cannot exceed 200 characters']
//     },
//     online: {
//         type: Boolean,
//         default: false
//     },
//     lastSeen: {
//         type: Date,
//         default: Date.now
//     },
//     followers: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }],
//     following: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }]
// }, {
//     timestamps: true
// });

// // ✅ CORRECT: Async function WITHOUT next parameter
// // userSchema.pre('save', async function () {
// //     // Only hash the password if it has been modified
// //     if (!this.isModified('password')) return;

// //     try {
// //         const salt = await bcrypt.genSalt(10);
// //         this.password = await bcrypt.hash(this.password, salt);
// //     } catch (error) {
// //         console.error('Error hashing password:', error);
// //         throw error;
// //     }
// // });

// // FIX your User model:
// userSchema.pre('save', async function (next) {  // Add 'next' parameter
//     // Only hash the password if it has been modified
//     if (!this.isModified('password')) return next();  // Call next()

//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();  // Call next() when done
//     } catch (error) {
//         next(error);  // Pass error to next
//     }
// });

// // Compare password method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     try {
//         return await bcrypt.compare(candidatePassword, this.password);
//     } catch (error) {
//         console.error('Error comparing password:', error);
//         throw error;
//     }
// };

// module.exports = mongoose.model('User', userSchema);


// models/User.js - CORRECTED VERSION// models/User.js - TEMPORARY SIMPLE VERSION
// models/User.js - SIMPLIFIED WORKING VERSION
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: '' },
    bio: { type: String, default: '' },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

// ✅ SIMPLE: Hash password before saving
userSchema.pre('save', function (next) {
    const user = this;

    // Only hash if password is modified or new
    if (!user.isModified('password')) return next();

    try {
        // Generate salt
        const salt = bcrypt.genSaltSync(10);
        // Hash the password
        user.password = bcrypt.hashSync(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);