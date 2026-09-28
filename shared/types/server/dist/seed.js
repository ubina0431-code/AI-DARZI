"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const User_1 = require("./models/User");
const CustomerProfile_1 = require("./models/CustomerProfile");
const TailorProfile_1 = require("./models/TailorProfile");
const MeasurementProfile_1 = require("./models/MeasurementProfile");
const Design_1 = require("./models/Design");
const Order_1 = require("./models/Order");
const OrderStatusHistory_1 = require("./models/OrderStatusHistory");
const ChatConversation_1 = require("./models/ChatConversation");
const ChatMessage_1 = require("./models/ChatMessage");
const Review_1 = require("./models/Review");
async function seedDatabase() {
    console.log('🌱 Starting database seed...');
    await mongoose_1.default.connect(config_1.config.mongoUri);
    console.log('✅ Connected to MongoDB');
    // Clear existing seed data (be careful in production!)
    const collections = [User_1.User, CustomerProfile_1.CustomerProfile, TailorProfile_1.TailorProfile, MeasurementProfile_1.MeasurementProfile, Design_1.Design, Order_1.Order, OrderStatusHistory_1.OrderStatusHistory, ChatConversation_1.ChatConversation, ChatMessage_1.ChatMessage, Review_1.Review];
    for (const model of collections) {
        await model.deleteMany({});
    }
    console.log('🗑️  Cleared existing data');
    // ============ CREATE ADMIN ============
    const admin = await User_1.User.create({
        email: 'admin@aidarzi.com',
        password: 'Admin@123456',
        firstName: 'AI Darzi',
        lastName: 'Admin',
        role: 'admin',
        isActive: true,
        isVerified: true,
    });
    console.log('✅ Admin created');
    // ============ CREATE CUSTOMERS ============
    const customer1 = await User_1.User.create({
        email: 'sara.khan@example.com',
        password: 'Customer@123',
        firstName: 'Sara',
        lastName: 'Khan',
        phone: '+923001234567',
        role: 'customer',
        isActive: true,
    });
    const customer2 = await User_1.User.create({
        email: 'maria.ahmed@example.com',
        password: 'Customer@123',
        firstName: 'Maria',
        lastName: 'Ahmed',
        phone: '+923009876543',
        role: 'customer',
        isActive: true,
    });
    const customer3 = await User_1.User.create({
        email: 'overseas.customer@example.com',
        password: 'Customer@123',
        firstName: 'Aisha',
        lastName: 'Malik',
        phone: '+447911234567',
        role: 'customer',
        isActive: true,
    });
    await CustomerProfile_1.CustomerProfile.create([
        {
            userId: customer1._id,
            gender: 'female',
            country: 'Pakistan',
            city: 'Lahore',
            isOverseas: false,
            currency: 'PKR',
            tailorPreferences: { genderPreference: 'female_only', hijabFriendly: false, homeService: false },
        },
        {
            userId: customer2._id,
            gender: 'female',
            country: 'Pakistan',
            city: 'Karachi',
            isOverseas: false,
            currency: 'PKR',
            tailorPreferences: { genderPreference: 'no_preference', hijabFriendly: true, homeService: true },
        },
        {
            userId: customer3._id,
            gender: 'female',
            country: 'United Kingdom',
            city: 'London',
            isOverseas: true,
            currency: 'GBP',
            tailorPreferences: { genderPreference: 'female_only', hijabFriendly: true, homeService: false },
        },
    ]);
    console.log('✅ Customers created');
    // ============ CREATE TAILORS ============
    const tailor1User = await User_1.User.create({
        email: 'nadia.boutique@example.com',
        password: 'Tailor@123',
        firstName: 'Nadia',
        lastName: 'Boutique',
        phone: '+923451234567',
        role: 'tailor',
        isActive: true,
        isVerified: true,
    });
    const tailor2User = await User_1.User.create({
        email: 'zara.fashion@example.com',
        password: 'Tailor@123',
        firstName: 'Zara',
        lastName: 'Fashion',
        phone: '+923339876543',
        role: 'tailor',
        isActive: true,
        isVerified: true,
    });
    const tailor3User = await User_1.User.create({
        email: 'hussain.tailors@example.com',
        password: 'Tailor@123',
        firstName: 'Muhammad',
        lastName: 'Hussain',
        phone: '+923001112222',
        role: 'tailor',
        isActive: true,
        isVerified: true,
    });
    const tailor4User = await User_1.User.create({
        email: 'fatima.bridal@example.com',
        password: 'Tailor@123',
        firstName: 'Fatima',
        lastName: 'Bridal',
        phone: '+923335556666',
        role: 'tailor',
        isActive: true,
    });
    const tailor5User = await User_1.User.create({
        email: 'classic.stitch@example.com',
        password: 'Tailor@123',
        firstName: 'Amna',
        lastName: 'Classic',
        phone: '+923217778888',
        role: 'tailor',
        isActive: true,
        isVerified: true,
    });
    const tailorProfiles = await TailorProfile_1.TailorProfile.create([
        {
            userId: tailor1User._id,
            businessName: 'Nadia\'s Couture',
            description: 'Specialized in bridal and formal Pakistani wear with over 15 years of experience. Expert in heavy embroidery and intricate detailing.',
            gender: 'female',
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: admin._id,
            specialties: ['bridal', 'formal', 'womens_wear', 'embroidery'],
            services: [
                { name: 'Bridal Lehnga', priceMin: 25000, priceMax: 80000, currency: 'PKR', estimatedDays: 21 },
                { name: 'Formal Three-Piece', priceMin: 8000, priceMax: 20000, currency: 'PKR', estimatedDays: 10 },
                { name: 'Anarkali Suit', priceMin: 5000, priceMax: 15000, currency: 'PKR', estimatedDays: 7 },
            ],
            location: { address: 'DHA Phase 5, Main Boulevard', city: 'Lahore', province: 'Punjab', country: 'Pakistan' },
            workingHours: { start: '10:00', end: '19:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
            isAvailable: true,
            isHijabFriendly: true,
            offersHomePickup: true,
            offersHomeDelivery: true,
            offersFemaleOnly: true,
            experienceYears: 15,
            rating: 4.8,
            totalReviews: 127,
            totalOrders: 342,
            completionRate: 98,
        },
        {
            userId: tailor2User._id,
            businessName: 'Zara Fashion House',
            description: 'Modern Pakistani fashion with a contemporary twist. Specializing in casual and semi-formal wear for everyday elegance.',
            gender: 'female',
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: admin._id,
            specialties: ['casual', 'formal', 'womens_wear', 'western'],
            services: [
                { name: 'Casual Kameez', priceMin: 2500, priceMax: 6000, currency: 'PKR', estimatedDays: 5 },
                { name: 'Two-Piece Suit', priceMin: 4000, priceMax: 10000, currency: 'PKR', estimatedDays: 7 },
                { name: 'Alteration', priceMin: 500, priceMax: 2000, currency: 'PKR', estimatedDays: 2 },
            ],
            location: { address: 'Gulberg III, Liberty Market Area', city: 'Lahore', province: 'Punjab', country: 'Pakistan' },
            workingHours: { start: '09:00', end: '18:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
            isAvailable: true,
            isHijabFriendly: false,
            offersHomePickup: false,
            offersHomeDelivery: true,
            offersFemaleOnly: false,
            experienceYears: 8,
            rating: 4.5,
            totalReviews: 89,
            totalOrders: 201,
            completionRate: 96,
        },
        {
            userId: tailor3User._id,
            businessName: 'Hussain Master Tailors',
            description: 'Expert menswear tailor. Specializing in shalwar kameez, sherwanis and formal suits for all occasions.',
            gender: 'male',
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: admin._id,
            specialties: ['formal', 'mens_wear', 'traditional'],
            services: [
                { name: 'Shalwar Kameez', priceMin: 2000, priceMax: 5000, currency: 'PKR', estimatedDays: 4 },
                { name: 'Sherwani', priceMin: 15000, priceMax: 40000, currency: 'PKR', estimatedDays: 14 },
                { name: 'Formal Suit', priceMin: 10000, priceMax: 25000, currency: 'PKR', estimatedDays: 10 },
            ],
            location: { address: 'Tariq Road, Near Teen Talwar', city: 'Karachi', province: 'Sindh', country: 'Pakistan' },
            workingHours: { start: '10:00', end: '20:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            isAvailable: true,
            isHijabFriendly: false,
            offersHomePickup: false,
            offersHomeDelivery: false,
            offersFemaleOnly: false,
            experienceYears: 20,
            rating: 4.9,
            totalReviews: 203,
            totalOrders: 567,
            completionRate: 99,
        },
        {
            userId: tailor4User._id,
            businessName: 'Fatima Bridal Studio',
            description: 'Your dream bridal look is our specialty. We create unforgettable bridal ensembles with premium fabrics and expert craftsmanship.',
            gender: 'female',
            isVerified: false,
            specialties: ['bridal', 'womens_wear', 'embroidery'],
            services: [
                { name: 'Complete Bridal Package', priceMin: 50000, priceMax: 200000, currency: 'PKR', estimatedDays: 30 },
                { name: 'Bridal Dupatta', priceMin: 10000, priceMax: 30000, currency: 'PKR', estimatedDays: 14 },
            ],
            location: { address: 'Bahria Town, Phase 4', city: 'Rawalpindi', province: 'Punjab', country: 'Pakistan' },
            workingHours: { start: '11:00', end: '18:00', days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
            isAvailable: true,
            isHijabFriendly: true,
            offersHomePickup: true,
            offersHomeDelivery: true,
            offersFemaleOnly: true,
            experienceYears: 12,
            rating: 4.7,
            totalReviews: 64,
            totalOrders: 98,
            completionRate: 95,
        },
        {
            userId: tailor5User._id,
            businessName: 'Classic Stitch Studio',
            description: 'Affordable quality tailoring for all occasions. Kids wear, casual, and formal suits done with love.',
            gender: 'female',
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: admin._id,
            specialties: ['casual', 'kids_wear', 'alterations', 'womens_wear'],
            services: [
                { name: 'Kids Dress', priceMin: 1500, priceMax: 4000, currency: 'PKR', estimatedDays: 4 },
                { name: 'Casual Suit', priceMin: 2000, priceMax: 5000, currency: 'PKR', estimatedDays: 5 },
                { name: 'Alterations', priceMin: 300, priceMax: 1500, currency: 'PKR', estimatedDays: 1 },
            ],
            location: { address: 'Model Town, Block C', city: 'Lahore', province: 'Punjab', country: 'Pakistan' },
            workingHours: { start: '09:00', end: '17:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
            isAvailable: true,
            isHijabFriendly: true,
            offersHomePickup: false,
            offersHomeDelivery: false,
            offersFemaleOnly: false,
            experienceYears: 5,
            rating: 4.3,
            totalReviews: 38,
            totalOrders: 89,
            completionRate: 93,
        },
    ]);
    console.log('✅ Tailors created');
    // ============ CREATE MEASUREMENTS ============
    const measurement1 = await MeasurementProfile_1.MeasurementProfile.create({
        customerId: customer1._id,
        name: 'My Standard Measurements',
        measurements: {
            shoulder: 15,
            chest: 36,
            waist: 30,
            hip: 38,
            sleeve: 22,
            armhole: 16,
            kameezeLength: 44,
            trouserLength: 40,
            neck: 13,
            wrist: 6,
            thigh: 22,
            inseam: 28,
        },
        unit: 'inches',
        isVerified: true,
        verifiedAt: new Date(),
        notes: 'Verified measurements - last updated Sept 2024',
    });
    console.log('✅ Measurements created');
    // ============ CREATE DESIGNS ============
    const design1 = await Design_1.Design.create({
        customerId: customer1._id,
        title: 'Elegant Eid Ensemble',
        prompt: 'An elegant dark green Eid suit with a long straight kameez, cigarette trousers and an organza dupatta with gold embroidery.',
        specification: {
            occasion: 'Eid',
            garmentType: 'three_piece',
            kameez: {
                style: 'straight',
                length: 'long',
                neckline: 'round',
                sleeves: 'full',
                cuffs: 'embroidered',
                embroidery: 'gold zari',
                fabric: 'silk',
            },
            bottom: {
                style: 'cigarette_trouser',
                fabric: 'silk',
                embroidery: 'none',
            },
            dupatta: {
                fabric: 'organza',
                embroidery: 'gold',
                border: 'heavy gold border',
            },
            colors: ['dark green', 'gold'],
            primaryColor: 'dark green',
            summary: 'Elegant dark green Eid suit with gold detailing',
        },
        status: 'saved',
        currentVersion: 1,
        tags: ['Eid', 'formal', 'green', 'gold'],
    });
    console.log('✅ Designs created');
    // ============ CREATE SAMPLE ORDER ============
    const conversation = await ChatConversation_1.ChatConversation.create({
        orderId: new mongoose_1.default.Types.ObjectId(),
        customerId: customer1._id,
        tailorId: tailor1User._id,
        participants: [customer1._id, tailor1User._id],
    });
    const order1 = await Order_1.Order.create({
        customerId: customer1._id,
        tailorId: tailor1User._id,
        designId: design1._id,
        measurementProfileId: measurement1._id,
        conversationId: conversation._id,
        title: 'Eid Special - Dark Green Suit',
        description: 'Elegant three-piece Eid suit as per design specification',
        specialInstructions: 'Please use heavy gold embroidery on cuffs and neckline',
        status: 'price_quoted',
        quotedPrice: 12000,
        currency: 'PKR',
        estimatedCompletionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        customerApprovedPrice: false,
        customerApprovedDesign: true,
        customerApprovedMeasurements: true,
    });
    // Fix conversation orderId
    await ChatConversation_1.ChatConversation.findByIdAndUpdate(conversation._id, { orderId: order1._id });
    await OrderStatusHistory_1.OrderStatusHistory.create([
        {
            orderId: order1._id,
            toStatus: 'created',
            changedBy: customer1._id,
            changedByRole: 'customer',
            note: 'Order placed',
        },
        {
            orderId: order1._id,
            fromStatus: 'created',
            toStatus: 'tailor_reviewing',
            changedBy: tailor1User._id,
            changedByRole: 'tailor',
            note: 'Started reviewing order',
        },
        {
            orderId: order1._id,
            fromStatus: 'tailor_reviewing',
            toStatus: 'price_quoted',
            changedBy: tailor1User._id,
            changedByRole: 'tailor',
            note: 'Price quoted: PKR 12,000',
        },
    ]);
    await ChatMessage_1.ChatMessage.create([
        {
            conversationId: conversation._id,
            senderId: customer1._id,
            senderRole: 'customer',
            content: 'Hi! I would like to order my Eid suit as per the design I shared.',
            type: 'text',
        },
        {
            conversationId: conversation._id,
            senderId: tailor1User._id,
            senderRole: 'tailor',
            content: 'Salaam! I have reviewed your design. Beautiful choice! I can create this for PKR 12,000. Estimated completion in 10 days. Does this work for you?',
            type: 'text',
        },
    ]);
    console.log('✅ Sample order and chat created');
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║         SEED COMPLETED SUCCESSFULLY       ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log('║  ADMIN:                                   ║');
    console.log('║    Email: admin@aidarzi.com               ║');
    console.log('║    Password: Admin@123456                 ║');
    console.log('║                                           ║');
    console.log('║  CUSTOMER 1:                              ║');
    console.log('║    Email: sara.khan@example.com           ║');
    console.log('║    Password: Customer@123                 ║');
    console.log('║                                           ║');
    console.log('║  CUSTOMER 2:                              ║');
    console.log('║    Email: maria.ahmed@example.com         ║');
    console.log('║    Password: Customer@123                 ║');
    console.log('║                                           ║');
    console.log('║  TAILOR 1 (Verified):                     ║');
    console.log('║    Email: nadia.boutique@example.com      ║');
    console.log('║    Password: Tailor@123                   ║');
    console.log('║                                           ║');
    console.log('║  TAILOR 2 (Verified):                     ║');
    console.log('║    Email: hussain.tailors@example.com     ║');
    console.log('║    Password: Tailor@123                   ║');
    console.log('╚═══════════════════════════════════════════╝');
    await mongoose_1.default.connection.close();
    process.exit(0);
}
seedDatabase().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map