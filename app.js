const express = require('express')
const app = express()
const port = 5000

const db = require('./connection/db')

// set view engine hbs
app.set ('view engine', 'hbs')
// set public path/folder
app.use('/public', express.static(__dirname + '/public')) 

app.use(express.urlencoded({extended: false}))

//SHOW FETCH DATABASE
app.get ('/', (req, res) => {
        db.connect((err, client, done) => {
        if (err) throw err

        client.query('SELECT * FROM tb_projects', (err, result) => {
            if (err) throw err
            let data = result.rows
            // console.log(result)
            
            data = data.map(function (item) {
                return {
                    title: item.title,
                    description: item.description.slice(0, 150) + '.....',
                    author: item.author,
                    sDate: item.sDate,
                    eDate: item.eDate,
                    duration: abtDuration(item.sDate, item.eDate),
                    techjs: item.techjs,
                    techreact: item.techreact,
                    technode: item.technode,
                    techvue: item.techvue,
                    id: item.id,
                }
            })
            res.render('index', { blogs: data })
        })
    })
})

// SHOW BLOG DETAIL
app.get('/blog/:id', (req, res) => {
    let id =  req.params.id
    // console.log(id);
    db.connect((err, client, done) => {
        if (err) throw err

        client.query (`SELECT * FROM tb_projects WHERE id = ${id}`, (err, result) =>{
            if (err) throw err
            done()
            let data = result.rows[0]
            // console.log(data);
            data.sDate = getFullTime(data.sDate)
            data.eDate = getFullTime(data.eDate)
            data.duration = abtDuration(data.sDate, data.eDate)
            res.render('blog', data)
        })
    })
})

// ADD PROJECT
app.post ('/add-project', (req, res) => {
    let data = req.body
    // console.log(data);
    let query = `INSERT INTO tb_projects (title, "sDate", "eDate", description, technode, techreact, techjs, techvue) VALUES ('${data.title}', '${data.sDate}', '${data.eDate}', '${data.description}', '{${data.technode}}', '{${data.techreact}}', '{${data.techjs}}', '{${data.techvue}}') `

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if (err) throw err
            done()

            res.redirect('/')
        })
    })
})

//DELETE PROJECT
app.get('/delete-project/:id', (req, res) => {
    let id = req.params.id
    let query = `DELETE FROM public.tb_projects WHERE id = ${id}`
    console.log(query);

    db.connect((err, client, done) => {
        if (err) throw err

        client.query(query, (err, result) => {
            if (err) throw err
            done ()

            res.redirect('/')
        })
    })
})

// GET DATA for update
app.get ('/update-project/:id', (req, res) =>{

    let id =  req.params.id
    // console.log(id);
    db.connect((err, client, done) => {
        if (err) throw err

        client.query (`SELECT * FROM tb_projects WHERE id = ${id}`, (err, result) =>{
            if (err) throw err
            done()
            let data = result.rows[0]
            data.startDate = getFullTime(data.sDate)
            data.endDate = getFullTime(data.eDate)

            console.log(data);
            res.render('update-project', {update: data, id})
        })
    })
})

//UPDATE POST DATA
app.post ('/update-project/:id', (req, res) => {
    let data = req.body
    let id = req.params.id
    let query = `UPDATE tb_projects SET title='${data.title}', "sDate"='${data.sDate}', "eDate"='${data.eDate}', description='${data.description}', image='{${data.image}}',techjs='{${data.techjs}}', technode='{${data.technode}}', techvue='{${data.techvue}}', techreact='{${data.techreact}}' WHERE id = ${id}`

    db.connect ((err, client, done) => {
        if (err) throw err

        client.query (query, (err, result) => {
            if (err) throw err
            done()

            res.redirect('/')

        })
    })

})



app.get ('/add-project', (req, res) => {
    res.render('add-project', {title: 'Halaman AddProject'})
})

app.get ('/contact', (req, res) =>{
    res.render('contact', {title: 'Halaman contact'})
})

app.get ('/add-my-project', (req, res) =>{
    res.render('add-my-project', {title: 'Halaman AddMyProject'})
})

app.use ('/', (req, res) => {
    res.status(404)
    res.send('<h1>404</h1>')
})



function abtDuration(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let duration = end.getTime() - start.getTime();
    let year = Math.floor(duration / (1000 * 3600 * 24 * 30 * 12))
    let month = Math.round(duration / (1000 * 3600 * 24 * 30));
    let day = duration / (1000 * 3600 * 24)
  
    if (day < 30) {
        return day + ' Day';
    } else if (month < 12) {
        return month + ' Month';
    } else {
        return year + ' Year'
    }

}

function getFullTime(waktu) {
    
    let month = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'October', 'December']
    
    let date = waktu.getDate().toString().padStart(2, "0");

    // console.log(date);
    let monthIndex = (waktu.getMonth() + 1).toString().padStart(2, "0")

    // console.log(month[monthIndex]);

    let year = waktu.getFullYear()
    // console.log(year);

    let hours = waktu.getHours()
    let minutes = waktu.getMinutes()

    let fullTime = `${year}-${monthIndex}-${date}`
    return fullTime
}

// function startdate(sDate){
//     let startdate = new Date(sDate);
//     const result = startdate.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//     let result_split = result.split("/");
//     let final_result = `${result_split[2]}-${result_split[1]}-${result_split[0]}`;
//     return final_result;
// }

app.listen(port, () =>{
    console.log(`Server listen at http://localhost: ${port}`)
})