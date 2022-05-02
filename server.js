const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const { flash } = require('express-flash-message')
const port = 3000

// app setup
app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
// app.set('trust proxy', 1)
app.use(session({
	resave: true,
	secret: 'mysecretkey',
	name: 'sessionId',
	saveUninitialized: true,
}))
app.use(flash({ sessionKeyName: 'flashMessage' }))

// users
const users = [{
	name: 'Saul Goodman',
	email: 'saulgoodman@gmail.com',
	password: 'bettercallsaul',
}]

// middlewares
const authorized = (req, res, next) => {
	let { user } = req.session
	if (!user) {
		return res.redirect('/login')
	}
	next()
}

const unauthorized = (req, res, next) => {
	let { user } = req.session
	if (user) {
		return res.redirect('/private')
	}
	next()
}

// app routes
app.get('/', (req, res) => {
	res.render('index')
})

app.use('/private', authorized)
app.get('/private', (req, res) => {
	let { user } = req.session
	res.render('private', { user })
})

app.use('/login', unauthorized)
app.get('/login', async (req, res) => {
	const errors = await req.consumeFlash('error')
	const old = await req.consumeFlash('old')
	res.render('login', {
		errors,
		old: old[0]
	})
})

app.post('/login', (req, res) => {
	let { email, password } = req.body	
	let user = users.find(u =>
		u.email == email && u.password == password
	)

	if (!user) {
		req.flash('error', 'Datos incorrectos')
		req.flash('old', { email })
		return res.redirect('/login')
	}

	req.session.user = user
	return res.redirect('/private')
})

app.post('/logout', (req, res) => {
	req.session.destroy()
	res.redirect('/')
})

app.listen(port, () => {
	console.log(`🌐 app funcionando en http://localhost:${port} 🌐`)
})