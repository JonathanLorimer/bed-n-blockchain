const Property = artifacts.require("./Property.sol")
const PropertyRegistry = artifacts.require("./PropertyRegistry.sol")
const PropertyToken = artifacts.require("./PropertyToken.sol")
const ETHER = 10**18

contract('PropertyRegistry Contract Tests', accounts => {
	// Accounts
	const alice = accounts[0], bob = accounts[1], frank = accounts[2]
	
	// Contract Addresses
	let propertyRegistry
	let propertyToken
	let property

	// Property Registry details
	let aliceToken
	let now = Math.floor(new Date().getTime() / 1000) - 100
	let tomorrow = now + 86400 //60s * 60m * 24hr
	const zeroAddress = '0x0000000000000000000000000000000000000000'
	
	// Property Token Details
	const allocation = 10000
	const price = 1

	it ('should have access to property contract, already deployed in property test', async () => {
		property =  await Property.at(Property.address);
		assert(property !== undefined, 'Property was NOT deployed')
	})

	it ('Alice should have a property token, setup property token for registry testing', async () => {
		try {
			const tx = await property.createProperty()
			aliceToken = await property.tokenOfOwnerByIndex(alice, 0)
			aliceToken = aliceToken.c[0]
		} catch(e){
			assert(false, 'setup property token failed')
		}
		assert(true, 'setup succeeded')
	})

    it('should be deployed, PropertyToken', async () => {
		propertyToken = await PropertyToken.deployed()
		assert(propertyToken !== undefined, 'PropertyToken was NOT deployed')
	})
	
	it('should be deployed, PropertyRegistry', async () => {
		propertyRegistry = await PropertyRegistry.deployed()
		assert(propertyRegistry !== undefined, 'PropertyRegistry was NOT deployed')
	})

	it('Alice should be able to mint tokens and transfer them to Bob', async () => {
		const tx = await propertyToken.mint(bob, allocation * ETHER);
		const balance = await propertyToken.balanceOf.call(bob);
		assert(balance.toNumber() === allocation*ETHER, 'Tokens should be equal to allocation')
	})

	it('should allow Bob to approve the property registry to use his tokens', async () => {
		try {
			const tx = await propertyToken.approve(propertyRegistry.address, price*ETHER, { from: bob });
		} catch(e){
			assert(false, `Bob could not approve property registry to use his tokens ${e}`)
		}
		assert(true, 'property registry has been approved');
	});

	it('should allow Bob to approve himself to use his tokens', async () => {
		try {
			const tx = await propertyToken.approve(bob, allocation*ETHER, { from: bob });
		} catch(e){
			assert(false, `Bob could not approve himself to use his tokens ${e}`)
		}
		assert(true, 'property registry has been approved');
	});

	it('Bob should be able to transfer some tokens to Frank', async () => {
		try {
			const tx = await propertyToken.transferFrom(bob, frank, 100*ETHER, { from: bob });
		} catch(e){
			console.log(e)
			assert(false, "Bob could not transfer tokens to Frank")
		}

		const bobBalance = await propertyToken.balanceOf.call(bob);
		const frankBalance = await propertyToken.balanceOf.call(frank);

		assert(bobBalance.toNumber() === (allocation - 100)*ETHER , 'Bob does not have correct balance');
		assert(frankBalance.toNumber() === 100*ETHER , 'Frank does not have correct balance');
	});

	it('should allow Frank to approve the property registry to use his tokens', async () => {
		try {
			const tx = await propertyToken.approve(propertyRegistry.address, price*ETHER, { from: frank });
		} catch(e){
			assert(false, `Frank could not approve property registry to use his tokens ${e}`)
		}
		assert(true, 'property registry has been approved');
	});


	it('It should allow Alice to register a property', async () => {
		try{
			const tx = await propertyRegistry.registerProperty(aliceToken, price*ETHER, 'http://my.house.com', {from: alice})
		
		} catch(e) {
			assert(false, 'Alice could not register property')
		}
		assert(true, 'Alice was able to register a property')
	})

	it('It should not allow Frank to register a property', async () => {
		try{
			const tx = await propertyRegistry.registerProperty(aliceToken, 1*ETHER, 'http://my.house.com', {from: frank})
		
		} catch(e) {
			assert(true, 'Frank could not register property')
			return
		}
		assert(false, 'Frank was able to register a property')
	})

	it('It should allow Bob to request stay', async () => {
		try{
			
			const tx = await propertyRegistry.requestStay(aliceToken, now, tomorrow, {from: bob})
		
		} catch(e) {
			assert(false, 'Bob could not request stay')

		}
		assert(true, 'Bob was able to request stay')

		let propertyDetails = await propertyRegistry.getStayData(aliceToken, {from: alice})
		assert(propertyDetails[0] === bob, 'Bob should have requested stay')
		assert(propertyDetails[1] === zeroAddress, 'Bob should not be approved')
		assert(propertyDetails[2] === zeroAddress, 'Bob should not be the occupant')
		assert(propertyDetails[3].c[0] === now, 'Check-in time should be now')
		assert(propertyDetails[4].c[0] === tomorrow, 'Check-out time should be tomorrow')
	})

	it('It should not allow Frank to request stay after Bob', async () => {
		try{
			
			const tx = await propertyRegistry.requestStay(aliceToken, now, tomorrow, {from: frank})
		
		} catch(e) {
			assert(true, 'Frank could not submit request after bob')
			return
		}
		assert(false, 'Frank could submit request after bob')
	})

	it('It should not allow Bob to Check-In before Alice has approved him', async () => {
		try{
			
			const tx = await propertyRegistry.checkIn(aliceToken, {from: bob})
		
		} catch(e) {
			assert(true, 'Bob could not check in before he was approved')
			return
		}
		assert(false, 'Bob could check in before he was approved')
	})

	it('It should allow Alice to approve Bob\'s request to stay', async () => {
		try{
			
			const tx = await propertyRegistry.approveRequest(aliceToken, {from: alice})
		
		} catch(e) {
			assert(true, 'Alice could not approve Bob\'s request')
		}
		let propertyDetails = await propertyRegistry.getStayData(aliceToken, {from: alice})
		assert(propertyDetails[1] === bob, 'Bob should be approved')
	})

	it('It should not allow Frank to Check-In', async () => {
		try{
			
			const tx = await propertyRegistry.checkIn(aliceToken, {from: frank})
		
		} catch(e) {
			assert(true, 'Frank could not check in when Bob was approved')
			return
		}
		assert(false, 'Frank could check in when Bob was approved')
	})

	it('It should allow Bob to Check-In now that he has been approved', async () => {
		try{
			
			const tx = await propertyRegistry.checkIn(aliceToken, {from: bob})
		
		} catch(e) {
			console.log(e)
			assert(false, 'Bob could not check in even though he was approved')
		}
		let propertyDetails = await propertyRegistry.getStayData(aliceToken, {from: alice})
		assert(propertyDetails[2] === bob, 'Bob could check in')
	})

	it('Bob, propertyRegistry, and Alice should all have the correct balance', async () => {
		const bobBalance = await propertyToken.balanceOf.call(bob);
		const registryBalance = await propertyToken.balanceOf.call(propertyRegistry.address);
		const aliceBalance = await propertyToken.balanceOf.call(alice);

		assert(bobBalance.toNumber() === (allocation - (100 + price))*ETHER , 'Bob does not have correct balance');
		assert(registryBalance.toNumber() === price*ETHER , 'registry does not have correct balance');
		assert(aliceBalance.toNumber() === 0 , 'Frank does not have correct balance');
	})

	it('It should allow Bob to check out now that he has Checked-In', async () => {
		try{
			
			const tx = await propertyRegistry.checkOut(aliceToken, {from: bob})
		
		} catch(e) {
			assert(false, 'Bob could not check out even though he was approved')
		}
		let propertyDetails = await propertyRegistry.getStayData(aliceToken, {from: alice})
		assert(propertyDetails[0] === zeroAddress, 'Bob could check out')
	})

	it('Bob, propertyRegistry, and Alice should all have the correct balance', async () => {
		const bobBalance = await propertyToken.balanceOf.call(bob);
		const registryBalance = await propertyToken.balanceOf.call(propertyRegistry.address);
		const aliceBalance = await propertyToken.balanceOf.call(alice);

		assert(bobBalance.toNumber() === (allocation - (100 + price))*ETHER , 'Bob does not have correct balance');
		assert(registryBalance.toNumber() === 0 , 'registry does not have correct balance');
		assert(aliceBalance.toNumber() === price*ETHER , 'Frank does not have correct balance');
	})

	it('It should allow Frank to request stay now that bob has Checked-Out', async () => {
		try{
			
			const tx = await propertyRegistry.requestStay(aliceToken, tomorrow, tomorrow + 1, {from: frank})
		
		} catch(e) {
			assert(false, 'Bob could not request stay')

		}
		assert(true, 'Bob was able to request stay')

		let propertyDetails = await propertyRegistry.getStayData(aliceToken, {from: alice})
		assert(propertyDetails[0] === frank, 'Frank should have requested stay')
		assert(propertyDetails[1] === bob, 'Bob should be the approved since he was last guest')
		assert(propertyDetails[2] === bob, 'Bob should be the occupant since he was last guest')
		assert(propertyDetails[3].c[0] === tomorrow, 'Check-in time should be tomorrow')
		assert(propertyDetails[4].c[0] === tomorrow+1, 'Check-out time should be tomorrow + 1')
	})

	it('It should allow Alice to approve Franks\'s request to stay', async () => {
		try{
			
			const tx = await propertyRegistry.approveRequest(aliceToken, {from: alice})
		
		} catch(e) {
			assert(true, 'Frank could not submit request after bob')
		}
		let propertyDetails = await propertyRegistry.getStayData(aliceToken, {from: alice})
		assert(propertyDetails[1] === frank, 'Bob should not be approved')
	})

	it('It should not allow Frank to Check-In because it is before his check in time', async () => {
		try{
			
			const tx = await propertyRegistry.checkIn(aliceToken, {from: frank})
		
		} catch(e) {
			assert(true, 'Frank could not check in when Bob was approved')
			return
		}
		assert(false, 'Frank could check in when Bob was approved')
	})


})