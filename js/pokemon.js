class Pokemon{

	apiUrl = 'https://pokeapi.co/api/v2/';
	name;
	data;
	id=0;
	level=1;
	statModifier=0.0;
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


	
	constructor(name, level=1, xp=0) {
		this.name = name;
		this.level = level;
		this.xp = xp;
		this.statModifier = this.level * 0.1;
		this.url = this.apiUrl + "pokemon/" + name;
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
		this.image = data.sprites.front_default;
		this.backImage = data.sprites.back_default;
		for(i in data.moves){
			this.moves.push(data.moves[i].move);
		}
		for(i in data.types){
			this.types.push(data.types[i].type);
		}

		this.hp = this.baseHp*this.level;
		this.attack = Math.round(this.baseAttack*this.statModifier);
		this.defense = Math.round(this.baseDefense*this.statModifier);
		this.specialAttack = Math.round(this.baseSpecialAttack*this.statModifier);
		this.specialDefense = Math.round(this.baseSpecialDefense*this.statModifier);
		this.speed = Math.round(this.baseSpeed*this.statModifier);
		this.xp = this.baseXp + this.xp;
		this.currentHp = this.hp;
	}

	isDead(){
		return (this.currentHp <= 0 ? true : false);
	}
}