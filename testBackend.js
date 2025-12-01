// Test Backend Connection
// Run this to verify your backend is working: node backend/testConnection.js

const https = require('https');

const BACKEND_URL = 'https://leetracker-cxzv.onrender.com';

console.log('🧪 Testing backend connection...\n');

// Test 1: Health Check
https.get(`${BACKEND_URL}/health`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Health Check:');
    console.log('   Status:', res.statusCode);
    console.log('   Response:', data);
    console.log('');
    
    // Test 2: API Base
    https.get(`${BACKEND_URL}/api/tracked-users`, (res2) => {
      console.log('✅ API Endpoint Check:');
      console.log('   Status:', res2.statusCode);
      console.log('   Headers:', res2.headers['content-type']);
      console.log('');
      console.log('🎉 Backend is working!');
      console.log('');
      console.log('📋 Next Step: Add to Vercel');
      console.log('   Go to: https://vercel.com/dashboard');
      console.log('   Settings → Environment Variables');
      console.log('   Add: VITE_API_URL = ' + BACKEND_URL);
      console.log('   Then redeploy!');
    }).on('error', (err) => {
      console.error('❌ API test failed:', err.message);
    });
  });
}).on('error', (err) => {
  console.error('❌ Health check failed:', err.message);
  console.error('');
  console.error('⚠️  Backend might not be deployed yet');
  console.error('   Check: https://dashboard.render.com');
});
