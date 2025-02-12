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


	attack(){
		this.enemy.currentHp -= this.player.attack;
		if(this.enemy.isDead()){
			this.healBelt();
			this.player.xp+=this.enemy.xp;
			eImg.setAttribute("src", "img/fatality.gif");
			if(this.autoCatch) this.catchPokemon(this.enemy);
			self = this
			window.setTimeout(function(){self.getNewEnemy()},300);
			this.player.levelUp();
			return;
		}
		// player moves first so this will be skipped if enemy dies
		this.player.currentHp -= this.enemy.attack;
		if(this.player.isDead()){
			pImg.setAttribute("src", "img/fatality.gif");
			this.enemy.setCurrentHp(this.enemy.currentHp*1.1);
			this.enemy.levelUp();
			this.removePokemonFromBelt(this.player);
			if(this.pokeBelt.length)this.getFirstPokemonFromBelt();
			if(this.player === undefined)this.getNewPlayer();
			return;
		}
		//nobody is dead, just refresh dom
		this.refreshDom();
	}

	attackNoBlock(){
		this.enemy.currentHp -= this.player.attack;
		if(this.enemy.isDead()){
			this.healBelt();
			this.player.xp+=this.enemy.xp;
			eImg.setAttribute("src", "img/fatality.gif");
			if(this.autoCatch) this.catchPokemon(this.enemy);
			this.getNewEnemy();
			this.player.levelUp();
			return;
		}
		// player moves first so this will be skipped if enemy dies
		this.player.currentHp -= this.enemy.attack;
		if(this.player.isDead()){
			pImg.setAttribute("src", "img/fatality.gif");
			this.enemy.setCurrentHp(this.enemy.currentHp*1.1);
			this.enemy.levelUp();
			this.removePokemonFromBelt(this.player);
			if(this.pokeBelt.length)this.getFirstPokemonFromBelt();
			if(this.player === undefined)this.getNewPlayer();
			return;
		}
		//nobody is dead, just refresh dom
		this.refreshDom();
	}

	itemChange(){
		//TODO
	}

	switchPokemon(direction=null){
		if(direction === 'left') this.getNextPokemonFromBelt();
		else if(direction === 'right') this.getPreviousPokemonFromBelt();
		else this.getFirstPokemonFromBelt();
		this.player.levelUp();
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

	getNewEnemy(pokeIndex=null){
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	this.enemyPokemon = this.pokemon[pokeIndex];

	  	this.enemy = new Pokemon(this.enemyPokemon.slug.eng, this.getLevel(1,this.player.level+20), 0);
  		if(this.cachedApiPokemon[this.enemy.name]){
  			console.log("POKEMON " + this.enemy.name +  " found in cache!");
  			this.enemy.buildFromRequest(this.cachedApiPokemon[this.enemy.name]);
				this.refreshDom();
				if(this.soundEnabled)enemy_audio.play();
  		}
  		else{
  			let self = this;
			fetch(pokeApi + this.enemy.name)
				.then((resp) => resp.json())
				.then(function(data){
					self.enemy.buildFromRequest(data);
					self.refreshDom();
					if(self.soundEnabled)enemy_audio.play();
					if(self.cachedApiPokemon[self.enemy.name] === undefined) self.cachedApiPokemon[self.enemy.name] = data; 
				})
				.catch(function(error){
				    console.log("API Error: " + error);
				    self.getNewEnemy();
				});
  		}
	}

	getNewPlayer(pokeIndex=null){
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	this.playerPokemon = this.pokemon[pokeIndex];

	  	this.player = new Pokemon(this.playerPokemon.slug.eng, this.getLevel(10,50), 0);
	  	this.pokeBelt[this.player.name] = this.player;
	  	if(this.cachedApiPokemon[this.player.name]){
  			console.log("POKEMON " + this.player.name +  " found in cache!");
  			this.player.buildFromRequest(this.cachedApiPokemon[this.player.name]);
				this.refreshDom();
				if(this.soundEnabled)player_audio.play();
  		}
  		else{
			let self = this;
		  	fetch(pokeApi + this.player.name)
				.then((resp) => resp.json())
				.then(function(data){
					self.player.buildFromRequest(data);
					self.refreshDom();
					if(self.soundEnabled)player_audio.play();
					if(self.cachedApiPokemon[self.player.name] === undefined) self.cachedApiPokemon[self.player.name] = data;
				})
				.catch(function(error){
				    console.log("API Error: " + error);
				    self.getNewPlayer();
				});
		}
	}

	getGoalPokemon(pokeIndex=null){
		if(this.staticRareIndex) pokeIndex = this.staticRareIndex;
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	let goalPokemon = this.pokemon[pokeIndex];

	  	this.goalPokemon = new Pokemon(goalPokemon.slug.eng, 50, 100);
  		if(this.cachedApiPokemon[this.goalPokemon.name]){
  			console.log("POKEMON " + this.goalPokemon.name +  " found in cache!");
  			this.goalPokemon.buildFromRequest(this.cachedApiPokemon[this.goalPokemon.name]);
  			gameGoalImgDom.setAttribute('src', this.goalPokemon.image);
			this.gameGoal = "Get a " + this.goalPokemon.name + " to level 125!";
			gameGoalDom.innerHTML = this.gameGoal;
  		}
  		else{
  			let self = this;
			fetch(pokeApi + this.goalPokemon.name)
				.then((resp) => resp.json())
				.then(function(data){
					self.goalPokemon.buildFromRequest(data);
					gameGoalImgDom.setAttribute('src', self.goalPokemon.image);
					self.gameGoal = "Get a " + self.goalPokemon.name + " to level 125!";
					gameGoalDom.innerHTML = self.gameGoal;
					if(self.cachedApiPokemon[self.goalPokemon.name] === undefined) self.cachedApiPokemon[self.goalPokemon.name] = data; 
				})
				.catch(function(error){
				    console.log("API Error: " + error);
				    self.getGoalPokemon();
				});
  		}
	}

	catchPokemon(pokemon){
		// TODO MATH ON FAIL OR SUCCESS
		pokemon.currentHp = 50;
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
				if(!this.rareAlerted) {
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
		pImg.setAttribute("width", width);
		pImg.setAttribute("height", height);
		pImg.setAttribute("src", this.player.backImage ? this.player.backImage : this.player.image);
		player_audio.setAttribute("src", this.player.cries);
		eName.innerHTML = this.enemy.name;
		eLevel.innerHTML = "l:" + this.enemy.level;
		eHealthBar.setAttribute("value", this.enemy.currentHp);
		eHealthBar.setAttribute("max", this.enemy.hp);
		eImg.setAttribute("width", width);
		eImg.setAttribute("height", height);
		eImg.setAttribute("src", this.enemy.image);
		enemy_audio.setAttribute("src", this.enemy.cries);
		if(this.achievements) this.displayAchievements;

	}

	initPokemon(){
		this.getNewPlayer();
		this.getNewEnemy(this.staticRareIndex);
	}

	initAll(){
		let self = this;
		$.get(host + "/pokedaemon/pokesprites/data/pokemon.json", function(data){
			let temp = [];
	  		for(let i in data){
	  			temp.push(data[i])
	  		}
	  		self.checkAutoCatch();
	  		self.checkSound();
	  		self.pokemon = temp;
	  		self.getGameGoal();
	  		self.getAchievements();
	  		self.displayAchievements();
	  		self.initPokemon();
	  	});
	}
}