const MAP_SIZE = 500
const NU_CENTER = ol.proj.fromLonLat([-87.6753, 42.056])

// downtown center, uncomment to use downtown instead, or make your own
// const NU_CENTER = ol.proj.fromLonLat([-87.6813, 42.049])
const AUTOMOVE_SPEED = 1
const UPDATE_RATE = 100
/*
 Apps are made out of a header (title/controls) and footer
 and some number of columns
 If its vertical, the columns can become sections in one column
 */
 const catimages = [
	"https://styles.redditmedia.com/t5_3obin/styles/communityIcon_5v6pv5kqz5241.PNG",
	"https://is1-ssl.mzstatic.com/image/thumb/Purple123/v4/6d/ff/d8/6dffd8ac-61bf-dab9-4095-3b0435ac4ca3/source/256x256bb.jpg",
	"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwwHTc0ijW8nPDs8hu2nlzMhzrbKqqEZHAGQ&usqp=CAU",
	"https://wallpaper.sc/en/ipad/wp-content/uploads/2018/08/ipad-2048x2048-thumbnail_01636-256x256.jpg",
	"https://a.thumbs.redditmedia.com/HaXDOt6VCSDYHNnBG2kmo7xArWVWkl8_QgppfGAQP-0.png",
	"https://images.pexels.com/users/avatars/3377911/sahar-tran-519.jpeg?auto=compress&fit=crop&h=256&w=256",
	"https://i.pinimg.com/474x/85/e2/52/85e252c562d58c8e743af09de056ca6e.jpg",
	"https://pbs.twimg.com/profile_images/664169149002874880/z1fmxo00_400x400.jpg",
	"https://bot.to/wp-content/uploads/2020/10/swag-cat_5f83fd035d490.png",
	"https://i.pinimg.com/474x/1b/e4/94/1be494c3c065c9c97da3231f7303ee85.jpg"
				   ]

let landmarkCount = 0

let gameState = {
	points: 0,
	captured: [],
	messages: []
}

// Create an interactive map
// Change any of these functions

let map = new InteractiveMap({
	mapCenter: NU_CENTER,

	// Ranges
	ranges: [500, 200, 90, 1], // must be in reverse order

	initializeMap() {
		// A good place to load landmarks
		this.loadLandmarks("landmarks-highway-nu", (landmark) => {
			// Keep this landmark?

			// Keep all landmarks in the set
			return true

			// Only keep this landmark if its a store or amenity, e.g.
			// return landmark.properties.amenity || landmark.properties.store
		})

		// Create random landmarks
		// You can also use this to create trails or clusters for the user to find
		const names = ["Luna", "Oliver", "Bella", "Leo", "Milo", "Lily", "Lucy", "Nala", "Charlie", "Max"]
		for (var i = 0; i < 10; i++) {

			// make a polar offset (radius, theta) 
			// from the map's center (units are *approximately* meters)
			let position = clonePolarOffset(NU_CENTER, 400*Math.random() + 300, 20*Math.random())
			this.createLandmark({
				pos: position,
				name: names[i],
			})
		}
	},

	update() {
		// Do something each frame
	},

	initializeLandmark: (landmark, isPlayer) => {
		// Add data to any landmark when it's created

		// Any openmap data?
		if (landmark.openMapData) {
			console.log(landmark.openMapData)
			landmark.name = landmark.openMapData.name
		}
		
		// *You* decide how to create a marker
		// These aren't used, but could be examples
		landmark.idNumber = landmarkCount++
		landmark.color = [Math.random(), 1, .5]

		// Give it a random number of points
		landmark.points = 5
		return landmark
	}, 

	onEnterRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user enters a range
		// -1 is not in any range

		console.log("enter", landmark.name, newLevel)
		if (newLevel == 2) {

			// Add points to my gamestate
			gameState.points += landmark.points

			// Have we captured this?
			if (!gameState.captured.includes(landmark.name)) {
				gameState.captured.push(landmark.name)
				// Add a message
				let message = `You captured ${landmark.name} for ${landmark.points} points`
				gameState.messages.push(message)
			}

		}
	},

	onExitRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user EXITS a range around a landmark 
		// e.g. (2->1, 0->-1)
		
		console.log("exit", landmark.name, newLevel)
	},
	
	
	featureToStyle: (landmark) => {
		// How should we draw this landmark?
		// Returns an object used to set up the drawing

		if (landmark.isPlayer) {
			return {
				icon: "person_pin_circle",
				iconColor:[0,0,.3],
				noBG: true // skip the background
			}
		}
		
		// Pick out a hue, we can reuse it for foreground and background
		let hue = 1
		return {
			label: landmark.name + "\n" + landmark.distanceToPlayer +"m"+"\n",
			fontSize: 9,

			// Icons (in icon folder)
			icon: "pets",

			// Colors are in HSL (hue, saturation, lightness)
			iconColor: [hue, 0, 0],
			noBG: true // skip the background
		}
	},

	
})



window.onload = (event) => {


	const app = new Vue({
		template: `
		<div id="app">
		<header></header>
			<div id="main-columns">

				<div class="main-column" style="flex:1;overflow:scroll;max-height:200px">
					(TODO, add your own gamestate)
					{{gameState.messages[gameState.messages.length-1]}}
					
				</div>

				<div class="main-column" style="overflow:hidden;width:${MAP_SIZE}px;height:${MAP_SIZE}px">
					<location-widget :map="map" />
				
				</div>

			</div>	
		<footer></footer>
		</div>`,

		data() {
			return {
			
				map: map,
				gameState: gameState
			}
		},

		// Get all of the intarsia components, plus various others
		components: Object.assign({
			// "user-widget": userWidget,
			// "room-widget": roomWidget,
			"location-widget": locationWidget,
		}),

		el: "#app"
	})

};

