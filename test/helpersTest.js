const {assert} = require('chai');
const {getUserFromDataBase} = require('../helpers');

const testUsers = {
  'oct4n3': {
    id: 'oct4n3',
    email: 'silva@octrain.com',
    password: 'stimpack'
  },

  'crypt0': {
    id: 'crypt0',
    email: 'offthegrid@naver.com',
    password: 'family' 
  },

  'w4ts0n': {
    id: 'w4ts0n',
    email: 'nessie@electricshock.com',
    password: 'current'
  }

}

describe('Testing helper function that obtains a user from the database based on their email.', () => {
  it('should return a user ID with a valid email', () => {
    const user = getUserFromDataBase('silva@octrain.com', testUsers);
    const expectedID = 'oct4n3';
    assert.equal(user.id, expectedID);
  })


  it('should return a user password with a valid email', () => {
    const user = getUserFromDataBase('offthegrid@naver.com', testUsers);
    const expectedID = 'family';
    assert.equal(user.password, expectedID);
  })

  it('should return a user email with a valid email', () => {
    const user = getUserFromDataBase('nessie@electricshock.com', testUsers);
    const expectedID = 'nessie@electricshock.com';
    assert.equal(user.email, expectedID);
  })

  it('should return undefined when given a email that is not in the database', () => {
    const user = getUserFromDataBase('rev@assassin.com', testUsers);
    const expectedID = undefined;
    assert.equal(user, undefined)
  })

  
})