class PokeDaemonGame{
	player = null;
	enemy = null;
	goalPokemon = null;
	gameGoal = '';
	pokemon = [];
	cachedApiPokemon = [];
	pokeBelt = [];
	rareAlerted = false;
	achievements = null;
	staticRareIndex = null;
	autoCatch = false;
	soundEnabled = false;


	constructor(){
		// Bound instance methods
    	this.attack = this.attack.bind(this);
    	this.attackNoBlock = this.attackNoBlock.bind(this);
    	this.itemChange = this.itemChange.bind(this);
    	this.switchPokemon = this.switchPokemon.bind(this);
    	this.poach = this.poach.bind(this);
    	this.run = this.run.bind(this);
    	this.release = this.release.bind(this);
    	this.checkAutoCatch = this.checkAutoCatch.bind(this);
    	this.checkSound = this.checkSound.bind(this);

		console.log("PokeDaemonGame created!");
	}

	async fetchIt(url){
		try{
			let response = await fetch(url);
			if(response.status === 200){
				return await response.json();
			}
			else{
				console.log("API Error: " + response.status);
				console.log(response);
			}
		}
		catch(e){
			console.log(e);
		}
		return false;
	}

	async fetchPokemon(url, error_callback){
		let response = await this.fetchIt(url);
		if(response){
			return response;
		}
		else{
			error_callback();
		}
	}


	attack(){
		this.enemy.currentHp -= this.player.attack;
		if(this.enemy.isDead()){
			this.healBelt();
			this.player.xp+=this.enemy.baseXp;
			eImg.setAttribute("src", "img/fatality.gif");
			if(this.autoCatch) this.catchPokemon(this.enemy);
			this.rareAlerted = false;
			this.getNewEnemy();
			//self = this
			// window.setTimeout(function(){self.getNewEnemy()},300);
			this.player.levelUp();
			this.player.heal(10);
			return;
		}
		// player moves first so this will be skipped if enemy dies
		this.player.currentHp -= this.enemy.attack;
		if(this.player.isDead()){
			pImg.setAttribute("src", "img/fatality.gif");
			this.enemy.levelUp();
			this.enemy.heal(10);
			this.removePokemonFromBelt(this.player);
			this.player = null;
			let beltLength = Object.keys(this.pokeBelt); // this is so I don't forget that this is an object and not an associative array!!! there is no fucking length!!!!
			if(beltLength)this.getFirstPokemonFromBelt();
			if(this.player === null)this.gameOver();
			return;
		}
		//nobody is dead, just refresh dom
		this.refreshDom();
	}

	attackNoBlock(){
		this.attack();
	}

	itemChange(){
		//TODO
	}

	switchPokemon(direction=null){
		if(direction === 'left') this.getNextPokemonFromBelt();
		else if(direction === 'right') this.getPreviousPokemonFromBelt();
		else this.getFirstPokemonFromBelt();
		this.player.levelUp(); // this is in just for cheating/debugging
		this.refreshDom();
	}

	poach(){
		pImg.setAttribute("src", "img/gunshot.gif");
		window.setTimeout(function(){eImg.setAttribute("src", "img/fatality.gif");}, 300);
		this.enemy.currentHp = 0;
		self = this
		window.setTimeout(function(){self.refreshDom(true);}, 800);
	}

	run(){
		this.getNewEnemy();
		this.refreshDom();
	}

	release(){
		this.removePokemonFromBelt(this.player);
		this.getFirstPokemonFromBelt();
		this.refreshDom();
	}

	checkAutoCatch(){
		this.autoCatch =  catchEnabledButton.checked ? true : false;
	}

	checkSound(){
		this.soundEnabled =  soundEnabledButton.checked ? true : false;
	}

	gameOver(){
		window.alert("(Boston Accent) What a fuckennnn LOOOOOSER!");
		this.initAll();
	}


	getLevel(min=1, max=100){
		max = max>100 ? 100 : max;
		min = Math.ceil(min);
    	max = Math.floor(max);
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getGameGoal(pokeIndex=null){
		this.rareAlerted = false;
		this.getGoalPokemon(pokeIndex);
	}

	checkGameGoal(){
		if(this.checkForWin()) {
			window.alert("YOU WIN!!!!!!!!!!!!!!!!!!!!!");
			this.setAchievements();
			this.displayAchievements();
			this.writeAchievements();
			this.getGameGoal();
		}
	}

	checkForWin(){
		if(this.player.name === this.goalPokemon.name && this.player.level >= 125) return true;
		else return false
	}

	getAchievements(){
		this.achievements = localStorage.getItem("pokedaemonAchievements") ? JSON.parse(localStorage.getItem("pokedaemonAchievements")) : [];
	}

	setAchievements(){
		let temp = this.goalPokemon;
		if(this.achievements !== null){
			this.achievements.push(temp);
		}
		else this.achievements = [temp];
	}

	writeAchievements(){
		localStorage.setItem("pokedaemonAchievements", JSON.stringify(this.achievements));
	}

	displayAchievements(){
		let rawHtml = '<h1>Achievements</h1>';
		for(let i in this.achievements){
			rawHtml += "<img style='background-image: url("+ "img/holographic.webp);" + "' src='" + this.achievements[i].image + "'/>";
		}
		achievementsAreaDom.innerHTML = rawHtml;
	}

	dumpCache(){
		let nameArr = Object.keys(this.cachedApiPokemon);
		for(let i in nameArr){
			secretAreaDom.innerHTML+= JSON.stringify(this.cachedApiPokemon[nameArr[i]]);
		}
	}

	async getNewEnemy(pokeIndex=null){
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	let enemyPokemon = this.pokemon[pokeIndex];

	  	this.enemy = new Pokemon(enemyPokemon.name, enemyPokemon.url, this.getLevel(1,this.player.level+20), 0);
  		if(this.cachedApiPokemon[this.enemy.name]){
  			console.log("POKEMON " + this.enemy.name +  " found in cache!");
  			enemyPokemon = this.cachedApiPokemon[this.enemy.name];
  		}
  		else{
			enemyPokemon = await this.fetchPokemon(this.enemy.url, this.getNewEnemy);
  		}
  		this.enemy.buildFromRequest(enemyPokemon);
		if(this.cachedApiPokemon[this.enemy.name] === undefined) this.cachedApiPokemon[this.enemy.name] = enemyPokemon;
		this.refreshDom();
		if(this.soundEnabled)enemy_audio.play();
	}

	async getNewPlayer(pokeIndex=null){
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	let playerPokemon = this.pokemon[pokeIndex];

	  	this.player = new Pokemon(playerPokemon.name, playerPokemon.url, this.getLevel(10,50), 50);
  		if(this.cachedApiPokemon[this.player.name]){
  			console.log("POKEMON " + this.player.name +  " found in cache!");
  			playerPokemon = this.cachedApiPokemon[this.player.name];
  		}
  		else{
			playerPokemon = await this.fetchPokemon(this.player.url, this.getNewPlayer);
  		}
  		this.player.buildFromRequest(playerPokemon);
		if(this.cachedApiPokemon[this.player.name] === undefined) this.cachedApiPokemon[this.player.name] = playerPokemon;
		this.refreshDom();
		if(this.soundEnabled)player_audio.play();
	}

	async getGoalPokemon(pokeIndex=null){
		if(this.staticRareIndex) pokeIndex = this.staticRareIndex;
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	let goalPokemon = this.pokemon[pokeIndex];

	  	this.goalPokemon = new Pokemon(goalPokemon.name, goalPokemon.url, 50, 100);
  		if(this.cachedApiPokemon[this.goalPokemon.name]){
  			console.log("POKEMON " + this.goalPokemon.name +  " found in cache!");
  			gameGoalImgDom.setAttribute('src', this.goalPokemon.image);
			this.gameGoal = "Get a " + this.goalPokemon.name + " to level 125!";
			gameGoalDom.innerHTML = this.gameGoal;
  		}
  		else{
			goalPokemon = await this.fetchPokemon(this.goalPokemon.url, this.getGoalPokemon);
  		}
  		this.goalPokemon.buildFromRequest(goalPokemon);
		if(this.cachedApiPokemon[this.goalPokemon.name] === undefined) this.cachedApiPokemon[this.goalPokemon.name] = goalPokemon;
		gameGoalImgDom.setAttribute('src', this.goalPokemon.image);
		this.gameGoal = "Get a " + this.goalPokemon.name + " to level 125!";
		gameGoalDom.innerHTML = this.gameGoal;
		this.refreshDom();
	}

	catchPokemon(pokemon){
		// TODO MATH ON FAIL OR SUCCESS
		pokemon.heal(10);
		if(Object.keys(this.pokeBelt).length < 6) this.addPokemonToBelt(pokemon);
	}

	addPokemonToBelt(pokemon){
		let index = Object.keys(this.pokeBelt).length+1;
		this.pokeBelt[pokemon.name] = pokemon;
		let ballHtml = "<img id='ball-" + index + "' class='ball' src='pokesprites/icons/ball/poke.png'/>";
		playerBelt.innerHTML+=ballHtml;
	}

	removePokemonFromBelt(pokemon){
		delete this.pokeBelt[pokemon.name];
		playerBelt.removeChild(playerBelt.lastChild);
	}

	getFirstPokemonFromBelt(){
		let nameArr = Object.keys(this.pokeBelt); // get the names in the belt as an array;
		this.player = this.pokeBelt[nameArr[0]];
		this.refreshDom();
	}

	getNextPokemonFromBelt(){
		let nameArr = Object.keys(this.pokeBelt); // get the names in the belt as an array;
		let currentIndex = nameArr.indexOf(this.player.name);
		let nextIndex = currentIndex === 0 ? nameArr.length-1 : currentIndex-1;
		let nextName = nameArr[nextIndex];
		this.player = this.pokeBelt[nextName];
	}
	getPreviousPokemonFromBelt(){
		let nameArr = Object.keys(this.pokeBelt); // get the names in the belt as an array;
		let currentIndex = nameArr.indexOf(this.player.name);
		let previousIndex = currentIndex === nameArr.length-1 ? 0 : currentIndex+1;
		let previousName = nameArr[previousIndex];
		this.player = this.pokeBelt[previousName];
	}

	healBelt(){
		let nameArr = Object.keys(this.pokeBelt); // get the names in the belt as an array;
		for(let i in nameArr){
			this.pokeBelt[nameArr[i]].heal(10);
		}
	}

	refreshDom(poach=false){
		if(this.goalPokemon){
			this.checkGameGoal();
			if(this.enemy.name === this.goalPokemon.name) {
				eImg.setAttribute("style", "background-image: url('img/holographic.webp')");
				if(!this.rareAlerted){
						window.alert("FOUND RARE POKEMON!!!!!!");
						this.rareAlerted = true;
				}
			}
			else eImg.setAttribute("style", "border: none;");
			if(this.player.name === this.goalPokemon.name) pImg.setAttribute("style", "background-image: url('img/holographic.webp')");
			else pImg.setAttribute("style", "border: none;");
		}
		pName.innerHTML = this.player.name;
		pLevel.innerHTML = "l:" + this.player.level;
		pHealth.innerHTML = "h/p " + this.player.currentHp + "/" + this.player.hp;
		pHealthBar.setAttribute("value", this.player.currentHp);
		pHealthBar.setAttribute("max", this.player.hp);
		// pImg.setAttribute("width", width);
		// pImg.setAttribute("height", height);
		pImg.setAttribute("src", this.player.backImage ? this.player.backImage : this.player.image);
		player_audio.setAttribute("src", this.player.cries);
		eName.innerHTML = this.enemy.name;
		eLevel.innerHTML = "l:" + this.enemy.level;
		eHealthBar.setAttribute("value", this.enemy.currentHp);
		eHealthBar.setAttribute("max", this.enemy.hp);
		// eImg.setAttribute("width", width);
		// eImg.setAttribute("height", height);
		eImg.setAttribute("src", this.enemy.image);
		enemy_audio.setAttribute("src", this.enemy.cries);
		if(this.achievements) this.displayAchievements;

	}

	initPokemon(){
		this.getNewPlayer();
		this.getNewEnemy(this.staticRareIndex);
	}

	restartGame(){
		this.pokeBelt = [];
		this.checkAutoCatch();
	  	this.checkSound();
	  	this.getGameGoal();
	  	this.getAchievements();
	  	this.displayAchievements();
	  	this.initPokemon();
	}

	async initAll(){
		let response = await fetch(host + "/pokedaemon/pokesprites/data/pokemon.json");
		if(response.status === 200){
			let data = await response.json();
			data = data.results;
			for(let i in data){
				this.pokemon.push(data[i]);
			}
	  		this.checkAutoCatch();
	  		this.checkSound();
	  		this.getGameGoal();
	  		this.getAchievements();
	  		this.displayAchievements();
	  		this.initPokemon();
		}
		else{
			console.log('API Error: ' + response.status);
			console.log(response);
		}
	}
}