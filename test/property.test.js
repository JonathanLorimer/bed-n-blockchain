const Property = artifacts.require("./Property.sol")
const ETHER = 10**18

contract('Property Token Contract Tests', accounts => {
	const alice = accounts[0], bob = accounts[1], frank = accounts[2]
	let property

	it('should be deployed, Property', async () => {
		property = await Property.deployed()
		assert(property !== undefined, 'Property was NOT deployed')
	})

	it('It should allow Alice to createProperty()', async () => {
		try{
			const tx = await property.createProperty()

		} catch(e) {
			assert(false, 'Alice could not create property')
		}
		assert(true, 'Alice was able to create a property')
	})


	it('Alice should have one token', async () => {
		const aliceTokens = await property.balanceOf(alice)
		assert(aliceTokens.c[0] === 1, `Expected Alice to have 1 token, alice had ${aliceTokens}`)
	})

	it('Alice should have a unique token id', async () => {
		const token = await property.tokenOfOwnerByIndex(alice, 0)
		assert(token.c[0] === 1, `Expected Alice to have token id 1, alice had token id ${token}`)
	})

	it('Alice should be able to setURI', async () => {
		try{
			const tx = await property.setURI(1, 'http://my.house.com', {from: alice})
		} catch(e) {
			assert(false, 'Alice was unable to set a property URI')
		}
		const aliceURI = await property.tokenURI(1)
		assert(aliceURI === 'http://my.house.com', 'Alice was able to set a URI')
	})

	it('Frank should not be able to setURI', async () => {
		try{
			const tx = await property.setURI(1, 'http://my.house.com', {from: frank})
		} catch(e) {
			assert(true, 'Frank was unable to set a property URI')
			return
		}
		assert(false, 'Frank was able to set a URI')
	})
})

