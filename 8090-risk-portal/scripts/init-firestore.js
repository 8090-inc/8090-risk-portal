import { Firestore } from '@google-cloud/firestore';
import bcrypt from 'bcryptjs';

const firestore = new Firestore({
  projectId: 'dompe-dev-439304',
});

async function initializeFirestore() {
  console.log('Initializing Firestore...');
  
  // Create collections
  const collections = ['users', 'sessions', 'audit_logs', 'password_reset_tokens'];
  
  for (const collection of collections) {
    const docRef = firestore.collection(collection).doc('_init');
    await docRef.set({ initialized: true });
    await docRef.delete();
    console.log(`✓ Collection '${collection}' initialized`);
  }
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = {
    id: firestore.collection('users').doc().id,
    email: 'rohit@8090.inc',
    passwordHash: hashedPassword,
    name: 'Rohit Kelapure',
    role: 'admin',
    department: 'Engineering',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await firestore.collection('users').doc(adminUser.id).set(adminUser);
  console.log(`✓ Admin user created: ${adminUser.email}`);
  console.log('  Password: admin123');
  
  // Create test users
  const testUsers = [
    { email: 'alex@8090.inc', name: 'Alex User', role: 'editor' },
    { email: 'jonathan@8090.inc', name: 'Jonathan User', role: 'viewer' }
  ];
  
  for (const user of testUsers) {
    const testHashedPassword = await bcrypt.hash('test123', 10);
    const userId = firestore.collection('users').doc().id;
    
    await firestore.collection('users').doc(userId).set({
      id: userId,
      email: user.email,
      passwordHash: testHashedPassword,
      name: user.name,
      role: user.role,
      department: 'Engineering',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✓ Test user created: ${user.email} (${user.role})`);
  }
  
  console.log('\n✅ Firestore initialization complete!');
}

initializeFirestore().catch(console.error);