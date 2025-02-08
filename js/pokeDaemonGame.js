class PokeDaemonGame{
	playerPokemon = null;
	enemyPokemon = null;
	initPlayerLevel = null;
	playerLevel = null;
	enemyLevel = null;
	p1 = null;
	e1 = null;
	goalPokemon = null;
	gameGoal = "Get a pokemon to level 100!";
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
    	this.itemChange = this.itemChange.bind(this);
    	this.switchPokemon = this.switchPokemon.bind(this);
    	this.poach = this.poach.bind(this);
    	this.run = this.run.bind(this);
    	this.release = this.release.bind(this);
    	this.checkAutoCatch = this.checkAutoCatch.bind(this);
    	this.checkSound = this.checkSound.bind(this);

		console.log("Game created!");
	}


	attack(){
		this.e1.currentHp -= this.p1.attack;
		this.p1.currentHp -= this.e1.attack;
		this.refreshDom();
	}

	itemChange(){
		//TODO
	}

	switchPokemon(direction=null){
		let nameArr = Object.keys(this.pokeBelt); // get the names in the belt as an array;
		let currentIndex = nameArr.indexOf(this.p1.name);
		let nextIndex = null;
		if(direction === 'left') nextIndex = currentIndex === 0 ? nameArr.length-1 : currentIndex-1;
		else nextIndex = currentIndex === nameArr.length-1 ? 0 : currentIndex+1;
		let nextName = nameArr[nextIndex];
		this.p1 = this.pokeBelt[nextName];
		this.refreshDom();
	}

	poach(){
		pImg.setAttribute("src", "img/gunshot.gif");
		eImg.setAttribute("src", "img/fatality.gif");
		this.e1.currentHp = 0;
		this.refreshDom(true);
	}

	run(){
		this.getNewEnemy();
	}

	release(){
		this.removePokemonFromBelt(this.p1);
		this.getFirstPokemonFromBelt();
		this.refreshDom();
	}

	checkAutoCatch(){
		this.autoCatch =  catchEnabledButton.checked ? true : false;
	}

	checkSound(){
		this.soundEnabled =  soundEnabledButton.checked ? true : false;
	}


	setLevels(playerLevel=null, enemyLevel=null){
		if(!playerLevel) this.playerLevel = Math.floor(Math.random() * 100);
		else this.playerLevel = playerLevel;
		let min  = this.playerLevel-10;
		min = min <= 1 ? 1 : min;
		if(!enemyLevel) this.enemyLevel = Math.floor(Math.random() * (this.playerLevel-min)) + min;
		else this.enemyLevel = enemyLevel;
	}

	getGameGoal(pokeIndex=null){
		this.rareAlerted = false;
		this.getGoalPokemon(pokeIndex);
	}

	checkGameGoal(){
		if(this.checkForWin()) {
			this.setAchievements();
			this.displayAchievements();
			window.alert("YOU WIN!!!!!!!!!!!!!!!!!!!!!");
			this.getGameGoal();
		}
	}

	checkForWin(){
		if(this.p1.name === this.goalPokemon.name && this.p1.level >= 125) return true;
		else return false
	}

	getAchievements(){
		this.achievements = localStorage.getItem("pokedaemonAchievements") ? JSON.parse(localStorage.getItem("pokedaemonAchievements")) : [];
	}

	setAchievements(){
		if(this.achievements !== null) this.achievements.push(this.goalPokemon);
		else this.achievements = [this.goalPokemon];
		localStorage.setItem("pokedaemonAchievements", JSON.stringify(this.achievements));
	}



	displayAchievements(){
		let oldImages = achievementsDom.getElementsByTagName('img');
		if(oldImages.length>0){
			for(let i in oldImages){
				oldImages[i].remove();
			}
		}
		for(let i in this.achievements){
			let image = document.createElement('img');
			image.setAttribute("style", "background-image: url('img/holographic.webp')");
			image.setAttribute("src", this.achievements[i].image);
			achievementsDom.appendChild(image);

		}
	}

	getNewEnemy(pokeIndex=null){
		this.setLevels(this.initPlayerLevel);
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	this.enemyPokemon = this.pokemon[pokeIndex];

	  	this.e1 = new Pokemon(this.enemyPokemon.slug.eng, this.enemyLevel, 100);
  		if(this.cachedApiPokemon[this.e1.name]){
  			console.log("POKEMON " + this.e1.name +  " found in cache!");
  			this.e1.buildFromRequest(this.cachedApiPokemon[this.e1.name]);
				this.refreshDom();
				if(this.soundEnabled)enemy_audio.play();
  		}
  		else{
  			let self = this;
			fetch(pokeApi + this.e1.name)
				.then((resp) => resp.json())
				.then(function(data){
					self.e1.buildFromRequest(data);
					self.refreshDom();
					if(self.soundEnabled)enemy_audio.play();
					if(self.cachedApiPokemon[self.e1.name] === undefined) self.cachedApiPokemon[self.e1.name] = data; 
				})
				.catch(function(error){
				    console.log("API Error: " + error);
				});
  		}
	}

	getNewPlayer(pokeIndex=null){
		this.setLevels();
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	this.playerPokemon = this.pokemon[pokeIndex];

	  	this.p1 = new Pokemon(this.playerPokemon.slug.eng, this.playerLevel, 100);
	  	this.pokeBelt[this.p1.name] = this.p1;
	  	if(this.cachedApiPokemon[this.p1.name]){
  			console.log("POKEMON " + this.p1.name +  " found in cache!");
  			this.p1.buildFromRequest(this.cachedApiPokemon[this.p1.name]);
				this.refreshDom();
				if(this.soundEnabled)player_audio.play();
  		}
  		else{
			let self = this;
		  	fetch(pokeApi + this.p1.name)
				.then((resp) => resp.json())
				.then(function(data){
					self.p1.buildFromRequest(data);
					self.refreshDom();
					if(self.soundEnabled)player_audio.play();
					if(self.cachedApiPokemon[self.p1.name] === undefined) self.cachedApiPokemon[self.p1.name] = data;
				})
				.catch(function(error){
				    console.log("API Error: " + error);
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
				});
  		}
	}

	getBallElement(id){
		let ball = document.createElement('img');
		ball.id = "ball-" + id;
		ball.class="ball"
		ball.src = "pokesprites/icons/ball/poke.png";
		return ball;

	}

	catchPokemon(pokemon){
		// TODO MATH ON FAIL OR SUCCESS
		if(Object.keys(this.pokeBelt).length <= 6) this.addPokemonToBelt(pokemon);
	}

	addPokemonToBelt(pokemon){
		let index = Object.keys(this.pokeBelt).length+1;
		this.pokeBelt[pokemon.name] = pokemon;
		playerBelt.appendChild(this.getBallElement(index));
	}

	removePokemonFromBelt(pokemon){
		delete this.pokeBelt[pokemon.name];
		playerBelt.removeChild(playerBelt.lastChild);
	}

	getFirstPokemonFromBelt(){
		let nameArr = Object.keys(this.pokeBelt); // get the names in the belt as an array;
		this.p1 = this.pokeBelt[nameArr[0]];
		this.refreshDom();
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
			if(this.e1.name === this.goalPokemon.name) {
				eImg.setAttribute("style", "background-image: url('img/holographic.webp')");
				if(!this.rareAlerted) {
						window.alert("FOUND RARE POKEMON!!!!!!");
						this.rareAlerted = true;
					}
			}
			else eImg.setAttribute("style", "border: none;");
			if(this.p1.name === this.goalPokemon.name) pImg.setAttribute("style", "background-image: url('img/holographic.webp')");
			else pImg.setAttribute("style", "border: none;");
		}
		pName.innerHTML = this.p1.name;
		pLevel.innerHTML = "l:" + this.p1.level;
		pHealth.innerHTML = "h/p " + this.p1.currentHp + "/" + this.p1.hp;
		pHealthBar.setAttribute("value", this.p1.currentHp);
		pHealthBar.setAttribute("max", this.p1.hp);
		pImg.setAttribute("width", width);
		pImg.setAttribute("height", height);
		pImg.setAttribute("src", this.p1.backImage);
		player_audio.setAttribute("src", this.p1.cries);
		eName.innerHTML = this.e1.name;
		eLevel.innerHTML = "l:" + this.e1.level;
		eHealthBar.setAttribute("value", this.e1.currentHp);
		eHealthBar.setAttribute("max", this.e1.hp);
		eImg.setAttribute("width", width);
		eImg.setAttribute("height", height);
		eImg.setAttribute("src", this.e1.image);
		enemy_audio.setAttribute("src", this.e1.cries);

		if(this.e1.isDead()){
			eImg.setAttribute("src", "img/fatality.gif");
			if(this.autoCatch && !poach)this.catchPokemon(this.e1);
			this.getNewEnemy();
			this.p1.xp+=this.e1.xp;
			this.healBelt();
			this.p1.calculateStats();
		}
		else if(this.p1.isDead()){
			pImg.setAttribute("src", "img/fatality.gif");
			this.e1.setCurrentHp(this.e1.currentHp*1.1);
			this.e1.xp+=this.p1.xp;
			this.e1.calculateStats();
			this.removePokemonFromBelt(this.p1);
			this.getFirstPokemonFromBelt();
			if(this.p1 === undefined)this.getNewPlayer();
		}

		if(this.achievements) this.displayAchievements;

	}

	refreshPokemon(){
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
	  		self.pokemon = temp;
	  		self.getGameGoal();
	  		self.getAchievements();
	  		self.displayAchievements();
	  		self.refreshPokemon();
	  	});
	}
}