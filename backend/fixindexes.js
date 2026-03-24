const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/attendance_portal')
  .then(async () => {
    const db = mongoose.connection;

    // Drop all indexes on users collection
    await db.collection('users').dropIndexes();
    console.log('✅ Indexes dropped');

    // Remove empty string values for rollCode and professorCode
    await db.collection('users').updateMany(
      { rollCode: '' },
      { $unset: { rollCode: '' } }
    );
    await db.collection('users').updateMany(
      { professorCode: '' },
      { $unset: { professorCode: '' } }
    );
    console.log('✅ Cleaned up empty rollCode and professorCode values');

    // Show current users
    const users = await db.collection('users').find({}, { projection: { email: 1, role: 1, rollCode: 1, professorCode: 1 } }).toArray();
    console.log('Current users in DB:');
    users.forEach(u => console.log(` - ${u.email} | ${u.role} | rollCode: ${u.rollCode || 'none'} | profCode: ${u.professorCode || 'none'}`));

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });