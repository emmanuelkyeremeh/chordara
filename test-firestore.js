// Test Firestore connection and save functionality
// Run this in browser console to test Firestore directly

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Use your Firebase config
const firebaseConfig = {
  // Add your config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  try {
    console.log('🧪 Testing Firestore connection...');
    
    // Test 1: Create a test document
    const testData = {
      userId: 'test-user-id',
      name: 'Test Track',
      description: 'Test track for debugging',
      createdAt: new Date(),
    };
    
    console.log('🧪 Creating test document...');
    const docRef = await addDoc(collection(db, 'tracks'), testData);
    console.log('✅ Test document created with ID:', docRef.id);
    
    // Test 2: Read all documents
    console.log('🧪 Reading all documents...');
    const snapshot = await getDocs(collection(db, 'tracks'));
    console.log('✅ Found', snapshot.docs.length, 'documents');
    
    snapshot.docs.forEach(doc => {
      console.log('📄 Document:', doc.id, doc.data());
    });
    
    return true;
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return false;
  }
}

// Run the test
testFirestore();
