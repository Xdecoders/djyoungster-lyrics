const bcrypt = require('bcryptjs')

async function hashPassword() {
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 12)
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('\nCopy this hash and use it in MySQL:')
  console.log(hash)
}

hashPassword()