const HelloWorld = artifacts.require("../contracts/HelloWorld.sol")

contract('HelloWorld Contract Tests', accounts => {
	let helloWorld
	const message = 'Hello World'
	const alice = accounts[0], bob = accounts[1]

	it('should be deployed, HelloWorld', async () => {
		helloWorld = await HelloWorld.deployed()
		assert(helloWorld !== undefined, 'HelloWorld was NOT deployed')
	})

	it(`should NOT let bob say ${message}`, async () => {
		
		try {
			const tx = await helloWorld.hello(message, {from: bob})
			
		} catch(e) {
			assert(true, 'Bob was not allowed to say hello')
			return
		}
		assert(false, 'Bob should not be able to say Hello, but he could')
	})

	it(`should allow alice to say ${message}`, async () => {
		try {
			const tx = await helloWorld.hello(message, {from: alice})
			assert(true, 'Alice was allowed to say hello')
		} catch(e){
			assert(false, 'Alice was NOT allowed to say hello')
		}
	})

	// A test to transfer ownership from Alice to Bob
	it(`should allow alice to transfer ownership to bob`, async () => {
		try {
			const tx = await helloWorld.transferOwnership(bob, {from: alice})
			assert(true, 'Alice was allowed to transfer to Bob')
		} catch(e){
			assert(false, 'Alice was NOT allowed to transfer to Bob')
		}
	})
	// A test to confirm that now Bob is the only one who can say "Hello"
	it(`should allow bob to say ${message}`, async () => {
		try {
			const tx = await helloWorld.hello(message, {from: bob})
			assert(true, 'Bob was allowed to say hello')
		} catch(e){
			assert(false, 'Bob was NOT allowed to say hello')
		}
	})
})