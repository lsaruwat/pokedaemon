class Pokemon{

	apiUrl = 'https://pokeapi.co/api/v2/';
	url = null;
	name;
	data;
	id=0;
	level=1;
	statModifier=0.5;
	xp=0;
	weight=0;
	height=0;
	baseXp=0;
	baseHp=0;
	baseAttack=0;
	baseDefense=0;
	baseSpecialAttack=0;
	baseSpecialDefense=0;
	baseSpeed=0;
	image;
	cries;
	backImage;
	types = [];
	moves = [];
	//calculated attributes
	hp=1;
	attack=0;
	defense=0;
	specialAttack=0;
	specialDefense=0;
	speed=0;
	//battle attributes
	currentHp=1;
	levelUpThreshold = 1000;
	maxLevel = 125;


	
	constructor(name, url, level=1, xp=0) {
		this.name = name;
		this.url = url;
		this.level = level;
		this.xp = xp;
		this.statModifier = this.level * 0.5;
		this.url = this.apiUrl + "pokemon/" + name;
	}

	setCurrentHp(hp){
		hp = Math.round(hp);
		this.currentHp = (hp > this.hp ? this.hp : hp);
	}

	buildFromRequest(data){
		this.id = data.id;
		this.weight = data.weight;
		this.height = data.height;
		this.baseXp = data.base_experience;
		this.baseHp = data.stats[0].base_stat;
		this.baseAttack = data.stats[1].base_stat;
		this.baseDefense = data.stats[2].base_stat;
		this.baseSpecialAttack = data.stats[3].base_stat;
		this.baseSpecialDefense = data.stats[4].base_stat;
		this.baseSpeed = data.stats[5].base_stat;
		// this.image = data.sprites.front_default ? data.sprites.front_default : data.sprites.other.showdown.front_default;
		// this.backImage = data.sprites.back_default ? data.sprites.back_default : data.sprites.other.showdown.back_default;
		this.image =  data.sprites.other.showdown.front_default ? data.sprites.other.showdown.front_default : data.sprites.front_default;
		this.backImage = data.sprites.other.showdown.back_default ? data.sprites.other.showdown.back_default : data.sprites.back_default;
		//TODO
		// this.setValidImages(data.sprites);
		this.cries = data.cries.latest;
		for(let i in data.moves){
			this.moves.push(data.moves[i].move);
		}
		for(let i in data.types){
			this.types.push(data.types[i].type);
		}
		this.statModifier = this.level * 0.5;
		this.hp = Math.round(this.baseHp*this.statModifier);
		this.currentHp = this.hp;
		this.calculateStats();
	}

	setValidImages(sprites){
		//TODO set valid images
	}

	isDead(){
		return (this.currentHp <= 0 ? true : false);
	}

	levelUp(){
		if(this.level<this.maxLevel){
			while(this.xp > this.levelUpThreshold*(this.level*.05)){
				this.level++;
				this.xp = this.xp - this.levelUpThreshold;
			}

		}
		this.calculateStats();
	}

	heal(healAmountPercent){
		let healthPercent = this.hp * (.01*healAmountPercent);
		this.currentHp+= healthPercent;
		this.currentHp = Math.round(this.currentHp);

		if(this.currentHp>=this.hp) this.currentHp = this.hp;
		if(this.currentHp<=0) this.currentHp=1;
	}

	calculateStats(){
		this.statModifier = this.level * 0.5;
		this.hp = Math.round(this.baseHp*this.statModifier);
		this.attack = Math.round(this.baseAttack*this.statModifier);
		this.defense = Math.round(this.baseDefense*this.statModifier);
		this.specialAttack = Math.round(this.baseSpecialAttack*this.statModifier);
		this.specialDefense = Math.round(this.baseSpecialDefense*this.statModifier);
		this.speed = Math.round(this.baseSpeed*this.statModifier);
		this.baseXp = Math.round(this.baseXp*this.statModifier);
	}
}