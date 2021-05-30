class Form{
	constructor(id, link){
		this.element = document.querySelector(`#${id}`);
		this.link = link;
        this.Categories();
		this.element.addEventListener('submit', this.submit.bind(this));
	}

	async submit(el){
		el.preventDefault();

		let jokeType = document.querySelector('input[name=joke_type]:checked');
		let url = this.link;

        if(jokeType.value=='random'){
            url += 'random';
			
        } else if(jokeType.value=='categories'){
            let category = document.querySelector('select');
            url += `random?category=${category.value}`;
			
        }else if(jokeType.value=='search'){
            let search_query = document.querySelector('#search_query');
			if(search_query.value===''){
				return search_query.focus();
			}else{
				url += `search?query=${search_query.value}`;
			}
        }
			let joke = await this.request(url);
			if(joke.result){
					joke = joke.result.map(joke => new Joke(joke))
			} else{
				joke = new Joke(joke);
			}
	}

	async request(url){
		let resolve = await fetch(url),
			data = await resolve.json();
		return data;
	}

	async Categories(){
		let categories = await this.request(`${this.link}categories`);
		categories = categories
			.map((category) => `<option value="${category}">${category}</option>`)
			.join('');

		let allCategories = document.querySelector('select#categories');
		allCategories.innerHTML = categories;
	}
}

class Joke{
	constructor(joke){
		this.create(joke);
		this.render();
	}

	create(joke){
		for(let key in joke){
			this[key] = joke[key];
		}
	}

	render(){
		let data = [];
		let jokeId = this.id;
		let jokeText = this.value;
		let jokeCategory = (this.categories) ?  this.categories : "";
		data.push(`<p class="jokeId">ID: <a href='https://api.chucknorris.io/jokes/${jokeId}' target="_blank">${jokeId}</a></p>`);
		data.push(`<p class="jokeText">${jokeText}</p>`);
		data.push(`<p class="jokeCategory">${jokeCategory}</p>`);

		let heartButton = document.createElement('button'); 
        if (this.favourite){
            heartButton.innerHTML = String.fromCodePoint(parseInt('1F499', 16))
        }else{
            heartButton.innerHTML = String.fromCodePoint(parseInt('1F90D', 16))
        }
        heartButton.dataset.id = 'heart_button';
		heartButton.dataset.favourite = this.favourite ? true : false;
		heartButton.addEventListener('click',this.addFavourite.bind(this));

		let favLi = document.createElement('p');
		favLi.prepend(heartButton);
		let list = document.createElement('div');
		list.dataset.id = this.id;
		list.dataset.class = 'filterJokes';
		list.innerHTML = data.join('');
		list.prepend(favLi);
		
		this.favourite ? jokesFav.prepend(list) : jokesAll.prepend(list);
	}

	addFavourite(){
		let jokeBtn = jokesAll.querySelector(`div[data-id="${this.id}"] button`);

		let storageJokes = localStorage.getItem('favJokes');
		storageJokes = storageJokes ? JSON.parse(storageJokes) : {};

		if(jokeBtn && jokeBtn.dataset.favourite==="false"){
			this.favourite = true;
			jokeBtn.innerHTML = String.fromCodePoint(parseInt('1F499', 16));
			jokeBtn.dataset.favourite = true;
			storageJokes[this.id] = this;
		} else{
			if(jokeBtn){
				jokeBtn.innerHTML = String.fromCodePoint(parseInt('1F90D', 16));
				jokeBtn.dataset.favourite = false;
			}
			this.favourite = false;
			delete storageJokes[this.id];
		}
		localStorage.setItem('favJokes', JSON.stringify(storageJokes) );
		Jokes.favourite();
	}
}

class Jokes{
	static favourite(){
		jokesFav.innerHTML = '';
		let storageJokes = localStorage.getItem('favJokes');

		if(storageJokes){
			storageJokes = JSON.parse(storageJokes);
			for(let key in storageJokes){
				new Joke(storageJokes[key]);
			}
		}
	}
}

let jokeForm = new Form('form', `https://api.chucknorris.io/jokes/`),
	jokesAll = document.querySelector('#jokes #all'),
	jokesFav = document.querySelector('#favourites');

Jokes.favourite();
