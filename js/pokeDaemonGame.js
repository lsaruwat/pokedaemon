class PokeDaemonGame{
	playerPokemon = null;
	enemyPokemon = null;
	initPlayerLevel = null;
	playerLevel = null;
	enemyLevel = null;
	p1 = null;
	e1 = null;
	pokemon = [];
	cachedApiPokemon = [];


	constructor(){
		// Bound instance methods
    	this.attack = this.attack.bind(this);
    	this.itemChange = this.itemChange.bind(this);
    	this.poach = this.poach.bind(this);
    	this.run = this.run.bind(this);

		console.log("Game created!");
	}


	attack(){
		this.e1.currentHp -= this.p1.attack;
		this.p1.currentHp -= this.e1.attack;
		this.refreshStats();
	}

	itemChange(){
		//TODO
	}

	poach(){
		pImg.setAttribute("src", "img/gunshot.gif");
		eImg.setAttribute("src", "img/fatality.gif");
		this.e1.currentHp = 0;
		this.refreshStats();
	}

	run(){
		this.getNewEnemy();
	}


	setLevels(playerLevel=null, enemyLevel=null){
		if(!playerLevel) this.playerLevel = Math.floor(Math.random() * 100);
		else this.playerLevel = playerLevel;
		let min  = this.playerLevel-10;
		min = min <= 1 ? 1 : min;
		if(!enemyLevel) this.enemyLevel = Math.floor(Math.random() * (this.playerLevel-min)) + min;
		else this.enemyLevel = enemyLevel;
	}

	getNewEnemy(pokeIndex=null){
		this.setLevels(this.initPlayerLevel);
		if(!pokeIndex) pokeIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
	  	this.enemyPokemon = this.pokemon[pokeIndex];

	  	this.e1 = new Pokemon(this.enemyPokemon.slug.eng, this.enemyLevel, 100);
  		if(this.cachedApiPokemon[this.e1.name]){
  			console.log("POKEMON " + this.e1.name +  " found in cache!");
  			this.e1.buildFromRequest(this.cachedApiPokemon[this.e1.name]);
				eImg.setAttribute("width", width);
	  			eImg.setAttribute("height", height);
				eImg.setAttribute("src", this.e1.image);
				enemy_audio.setAttribute("src", this.e1.cries);
				enemy_audio.play();
				this.refreshStats();
  		}
  		else{
  			let self = this;
			fetch(pokeApi + this.e1.name)
				.then((resp) => resp.json())
				.then(function(data){
					self.e1.buildFromRequest(data);
					eImg.setAttribute("width", width);
		  			eImg.setAttribute("height", height);
					eImg.setAttribute("src", self.e1.image);
					enemy_audio.setAttribute("src", self.e1.cries);
					enemy_audio.play();
					self.refreshStats();
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
	  	if(this.cachedApiPokemon[this.p1.name]){
  			console.log("POKEMON " + this.p1.name +  " found in cache!");
  			this.p1.buildFromRequest(this.cachedApiPokemon[this.p1.name]);
				pImg.setAttribute("width", width);
	  			pImg.setAttribute("height", height);
				pImg.setAttribute("src", this.p1.backImage);
				player_audio.setAttribute("src", this.p1.cries);
				player_audio.play();
				this.refreshStats();
  		}
  		else{
			let self = this;
		  	fetch(pokeApi + this.p1.name)
				.then((resp) => resp.json())
				.then(function(data){
					self.p1.buildFromRequest(data);
					pImg.setAttribute("width", width);
		  			pImg.setAttribute("height", height);
					pImg.setAttribute("src", self.p1.backImage);
					player_audio.setAttribute("src", self.p1.cries);
					player_audio.play();
					self.refreshStats();
					if(self.cachedApiPokemon[self.p1.name] === undefined) self.cachedApiPokemon[self.p1.name] = data;
				})
				.catch(function(error){
				    console.log("API Error: " + error);
				});
		}
	}

	refreshStats(){
		pName.innerHTML = this.p1.name;
		pLevel.innerHTML = "l:" + this.p1.level;
		pHealth.innerHTML = "h/p " + this.p1.currentHp + "/" + this.p1.hp;
		pHealthBar.setAttribute("value", this.p1.currentHp);
		pHealthBar.setAttribute("max", this.p1.hp);
		eName.innerHTML = this.e1.name;
		eLevel.innerHTML = "l:" + this.e1.level;
		eHealthBar.setAttribute("value", this.e1.currentHp);
		eHealthBar.setAttribute("max", this.e1.hp);

		if(this.e1.isDead()){
			eImg.setAttribute("src", "img/fatality.gif");
			this.getNewEnemy();
			this.p1.setCurrentHp(this.p1.currentHp*1.5);
			this.p1.xp+=this.e1.xp;
			this.p1.calculateStats();
		}
		else if(this.p1.isDead()){
			let newIndex = Math.floor(Math.random() * Math.floor(this.pokemon.length));
			this.getNewPlayer();
			this.e1.setCurrentHp(this.e1.currentHp*1.1);
			this.e1.xp+=this.p1.xp;
			this.e1.calculateStats();
		}

	}

	refreshPokemon(){
		this.getNewPlayer();
		this.getNewEnemy();
	}

	initAll(){
		let self = this;
		$.get(host + "/pokedaemon/pokesprites/data/pokemon.json", function(data){
			let temp = [];
	  		for(let i in data){
	  			temp.push(data[i])
	  		}
	  		self.pokemon = temp;
	  		self.refreshPokemon();	
	  	});
	}
}