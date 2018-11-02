const Property = artifacts.require("../contracts/Property.sol")
const ETHER = 10**18

contract('Property Contract Tests', accounts => {
	let property
	const alice = accounts[0], bob = accounts[1], frank = accounts[2]
	
	it('should be deployed, Property', async () => {
		property = await Property.deployed()
		assert(property !== undefined, 'HelloWorld was NOT deployed')
	})

	it("Owner (Alice) should be able to invite guest (Bob)", async () => {
		
		try {
			const tx = await property.inviteGuest(bob, {from: alice})
		} catch(e) {
			assert(false, 'Alice was not allowed to invite Bob as a guest')
		}
		assert(true, 'Alice succesfully invited Bob as a guest')
	})

	it("Non-owner (Bob) should not be able to invite guest (frank)", async () => {
		
		try {
			const tx = await property.inviteGuest(frank, {from: bob})

		} catch(e) {
			assert(true, 'Bob was not allowed to invite Frank as a guest')
			return
		}
		assert(false, 'Bob was able to invite Frank as a guest')

	})

	it("Guest (Bob) should be able to reserve room", async () => {
		
		try {
			const tx = await property.reserveRoom({from: bob, value: 1 * ETHER})
		} catch(e) {
			assert(false, 'Bob was not allowed to reserve a room')
		}
		assert(true, 'Bob was able to reserve a room')

	})

	it('Non-guest (Frank) should not be able to reserve room', async () => {

		try {
			const tx = await property.reserveRoom({from: frank, value: 1 * ETHER})
		} catch(e){
			assert(true, 'Non-guest (Frank) was not able to reserve a room')
			return
		}
		assert(false, 'Non-guest (Frank) was able to reserve a room')
	})

	it('Second guest (Frank) should not be able to reserve room if already occupied by guest (Bob)', async () => {
		
		try {
			const setGuest = await property.inviteGuest(frank, {from: alice})
		} catch(e){
			assert(false, 'Alice was unable to set new guest')
		}

		console.log('Alice was able to set new guest')

		try {
			const attemptToReserveRoom = await property.reserveRoom({from: frank, value: 1 * ETHER})
		} catch(e){
			assert(true, 'Guest (Frank) was not able to reserve room while it was occupied')
			return
		}

		assert(false, 'Guest (Frank) was able to reserve room while it was occupied')
		
	})

})