// 1. express js adalah framework utk membuat web server jadi lebih cepat, sama halnya seperti bootstrap
// const { response } = require('express');
const { request, response } = require('express');
const express = require ('express'); // 2. atau bisa juga import express from "express"
const { Client } = require('pg');
const { copyDone } = require('pg-protocol/dist/messages');
// const { request } = require('http');
// const { connected } = require('process');
const app = express()

// 3. lalu buat port untk menjalankan si express js
const port = 12000 // 4.utk mendeklar variabel portnya berapa

app.set('view engine', 'hbs') // untuk menggunakan setingan view engine template enginenya, dari npm hbs, lalu rename file html menjadi hbs
app.use('/assets', express.static(__dirname + '/assets')) // utk node js agar mendetect path dari css di folder assets, agar bisa combine dengan file hbs
app.use(express.urlencoded({extended: false})) // supaya tidak undefined dalam console.log, kita isikan ini, karena data masih berupa object, maka harus diisi url encodenya dalam express
const db=require('./connection/db') //lakukan import dari db.js di folder connection, karena telah melakukan exports

// let dataBlog = [ // data dummy atau data statis
//     {
//         projectName: "Dumbways project-1",
//         description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis quibusdam maxime iure sapiente magnam natus odio voluptatum magni quae accusamus.",
//         technologies1: "fa-js",
//         technologies2: "fa-php",
//         technologies3: "fa-react",
//         technologies4: "fa-node-js",
//         postAt: new Date(),
//         startDate: "2022-08-21",
//         endDate: "2022-09-22",
//     }
// ]

app.get( '/', (request, response) => { //jadi ketika ada yang akses routing / ini, maka dia akan melakukan apa di anonymous functionnya, yang dimana memiliki 2 parameter, request dan response
    // console.log(dataBlog);

    // let data=dataBlog.map((item) => { //sudah sesuai pakem dari si looping map
    //     return { //...item adalah split operator utk mengeluarkan data si item, kalau kita mau memanipulasi dataBlog nya
    //         ...item,
    //         postAt: getFullTime(item.postAt),
    //         duration: getDistanceTime(new Date(item.startDate), new Date(item.endDate)),
    //     } 
    // })
    // console.log(data)
    db.connect ((err, client, done) => { //jadi didalam connect datanya akan disimpan kedalam client sama seperti fungsinya dengan app.get, nah jika didalam connect datanya tidak terhubung ke dalam database maka akan disimpan di dalam err
        if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam connection databasenya
        //lalu kita lakukan query
        client.query('SELECT * FROM public.tb_projects ORDER BY id DESC;', (err, result) => {
            if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam query databasenya, dan jika tidak kita gunakan if {err} ini maka akan terus lanjut saja
            
            // console.log(result.rows);

            let data=result.rows
            dataBlog2=data.map((item) =>{ //fungsi map adalah utk memanipulasi datanya, bisa dinamis
                return {
                    ...item,
                    postAt: getFullTime(item.postAt),
                    start_date: getFullTime2(item.start_date),
                    end_date: getFullTime2(item.end_date),
                    duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date)),
                }
            })

            response.render ('index', {dataBlog: dataBlog2}) // dataBlog: data adalah pemamnggilan utk let data diatas
        })
    })

})

app.get( '/myproject', (request, response) => {
    response.render ('myproject')
})

app.post( '/myproject', (request, response) => {
    // console.log(request.body)
    
    let projectName = request.body.inputProject
    let startDate = request.body.inputStartDate
    let endDate = request.body.inputEndDate
    let description = request.body.inputDescription
    let technologies1 = request.body.inputTechnologiesJs
    let technologies2 = request.body.inputTechnologiesPhp
    let technologies3 = request.body.inputTechnologiesReact
    let technologies4 = request.body.inputTechnologiesNodeJs
    let images = request.body.inputImage

    // let = {inputProject: projectName, inputStartDate: startDate} = request.body , atau bisa juga dngan cara seperti ini

    db.connect ((err, client, done) => { //jadi didalam connect datanya akan disimpan kedalam client sama seperti fungsinya dengan app.get, nah jika didalam connect datanya tidak terhubung ke dalam database maka akan disimpan di dalam err
        if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam connection databasenya
        //lalu kita lakukan query
        let query=`INSERT INTO public.tb_projects(name, start_date, end_date, description, technologies, image) VALUES
                        ('${projectName}', '${startDate}', '${endDate}', '${description}', '{"${technologies1}", "${technologies2}", "${technologies3}", "${technologies4}"}', '${images}')`
        
        client.query(query, (err, result) => {
            if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam query databasenya, dan jika tidak kita gunakan if {err} ini maka akan terus lanjut saja

            console.log(query);

            response.redirect ('/') //{data} aslinya ditaruk di dalam buka kurung
        })
    })

    // response.redirect ('/') //supaya web browser tidak loading terus"an, maka kita kasih response.render atau inner.html menuju halaman index
})

app.get( '/update-myproject/:idParams', (request, response) => {
    let id=request.params.idParams
    // console.log(id);

    db.connect ((err, client, done) => { //jadi didalam connect datanya akan disimpan kedalam client sama seperti fungsinya dengan app.get, nah jika didalam connect datanya tidak terhubung ke dalam database maka akan disimpan di dalam err
        if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam connection databasenya
        //lalu kita lakukan query
        let query=`SELECT * FROM public.tb_projects WHERE id=${id}`

        client.query(query, (err, result) => {
            if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam query databasenya, dan jika tidak kita gunakan if {err} ini maka akan terus lanjut saja
            
            let data=result.rows // utk menampilkan ke object properties nya, bukan lagi array object yang tampail di console log nya
            console.log(data[0]);

            dataBlog3=data.map((item) => { //fungsi map adalah utk memanipulasi datanya, bisa dinamis
                return {
                    ...item,
                    postAt: getFullTime(item.postAt),
                    start_date: getFullTime3(item.start_date),
                    end_date: getFullTime3(item.end_date),
                }
            })

            console.log(dataBlog3[0]);

            // response.render ('index', {dataBlog: dataBlog2}) // dataBlog: data adalah pemamnggilan utk let data diatas
            response.render ('update-myproject', {data: dataBlog3[0]}) //{data} aslinya ditaruk di dalam buka kurung
        })
    })
})

app.post('/update-myproject/:idParams', (request, response) => {

    let id=request.params.idParams

    let projectName = request.body.inputProject
    let startDate = request.body.inputStartDate
    let endDate = request.body.inputEndDate
    let description = request.body.inputDescription
    let technologies1 = request.body.inputTechnologiesJs
    let technologies2 = request.body.inputTechnologiesPhp
    let technologies3 = request.body.inputTechnologiesReact
    let technologies4 = request.body.inputTechnologiesNodeJs
    let images = request.body.inputImage

    db.connect ((err, client, done) => { //jadi didalam connect datanya akan disimpan kedalam client sama seperti fungsinya dengan app.get, nah jika didalam connect datanya tidak terhubung ke dalam database maka akan disimpan di dalam err
        if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam connection databasenya
        //lalu kita lakukan query
        let query=`UPDATE public.tb_projects
                    SET name='${projectName}', start_date='${startDate}', end_date='${endDate}', description='${description}', technologies='{"${technologies1}", "${technologies2}", "${technologies3}", "${technologies4}"}', image='${images}'
                    WHERE id='${id}';`

        client.query(query, (err, result) => {
            if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam query databasenya, dan jika tidak kita gunakan if {err} ini maka akan terus lanjut saja

            console.log(query);

            // response.render ('index', {dataBlog: dataBlog2}) // dataBlog: data adalah pemamnggilan utk let data diatas
            response.redirect ('/') //{data} aslinya ditaruk di dalam buka kurung
        })
    })
})

app.get( '/contact', (request, response) => {
    response.render ('contact')
})

app.get( '/myproject-detail/:id', (request, response) => { //:name ini bisa diisikan apa saja, karena menjadi penampung si paramsnya, maka nanti yang muncul di console.log nya adalah name : bimbi-naufal sesuai yang diisikan oleh user

    // let index=request.params.index // agar yang diisi oleh user ini yakni bimbi-naufal ini keluar dari console.log object, maka kita kasih titik setelah params.name
    // // console.log(id)

    // let data= dataBlog[index]

    // data= {
    //     projectName: data.projectName,
    //     startDate: data.startDate,
    //     endDate: data.endDate,
    //     duration: getDistanceTime(new Date(data.startDate), new Date(data.endDate)),
    //     description: data.description
    // }

    let id=request.params.id

    
    db.connect ((err, client, done) => { //jadi didalam connect datanya akan disimpan kedalam client sama seperti fungsinya dengan app.get, nah jika didalam connect datanya tidak terhubung ke dalam database maka akan disimpan di dalam err
        if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam connection databasenya
        //lalu kita lakukan query
        let query=`SELECT * FROM public.tb_projects WHERE id=${id}`

        client.query(query, (err, result) => {
            if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam query databasenya, dan jika tidak kita gunakan if {err} ini maka akan terus lanjut saja
            
            let data=result.rows // utk menampilkan ke object properties nya, bukan lagi array object yang tampail di console log nya
            // console.log(data);


            dataBlog2=data.map((item) =>{ //fungsi map adalah utk memanipulasi datanya, bisa dinamis
                return {
                    ...item,
                    postAt: getFullTime(item.postAt),
                    start_date: getFullTime2(item.start_date),
                    end_date: getFullTime2(item.end_date),
                    duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date)),
                }
                
            })
            // console.log(dataBlog2)

            // response.render ('index', {dataBlog: dataBlog2}) // dataBlog: data adalah pemamnggilan utk let data diatas
            response.render ('myproject-detail', {data: dataBlog2[0]}) //{data} aslinya ditaruk di dalam buka kurung
        })
    })

})

app.get("/delete-blog/:idParams", (request, response) => {

    let id=request.params.idParams

    db.connect ((err, client, done) => { //jadi didalam connect datanya akan disimpan kedalam client sama seperti fungsinya dengan app.get, nah jika didalam connect datanya tidak terhubung ke dalam database maka akan disimpan di dalam err
        if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam connection databasenya
        //lalu kita lakukan query
        let query=`DELETE FROM public.tb_projects WHERE id=${id}`
        
        client.query(query, (err, result) => {
            if (err) throw err //gunanya adalah utk melihat apakah ada error ataukah tidak dalam query databasenya, dan jika tidak kita gunakan if {err} ini maka akan terus lanjut saja

            response.redirect ('/') //{data} aslinya ditaruk di dalam buka kurung
        })
    })

    // // console.log(index)
    // dataBlog.splice(index, 1)

    // response.redirect('/')
})

// 6. atau bisa juga seperti ini 
// app.get ( '/', function(request,response) {
//     response.send("Hello World!")
// })

// 7. response.send sama seperti document.writeln pada javascript
// response.render sama seperti inner.html pada javascript
// response.redirect utk post blog

// 8. kalau ingin merefresh tekan ctrl + c

// 9. install nodemon utk proses development aja, namun saat melakukan hosting/ produksi / bisa diakses ke semua orang lewat internet, tidak akan kita install

// 10. cara menjalankan nodemon adalah dengan npm start, maka dia akan otomatis refresh di server node js


function getFullTime(time){

    let month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    // console.log(date);
    // console.log(month[monthIndex]);
    // console.log(year);

    // console.log(hours);
    // console.log(minutes);

    if(hours < 10){
        hours = "0" + hours
    }else if(minutes < 10){
        minutes = "0" + minutes
    }
    
    // 12 Agustus 2022 09.04
    let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
    // console.log(fullTime);
    return fullTime
}

function getFullTime2(time){

    let month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    // console.log(date);
    // console.log(month[monthIndex]);
    // console.log(year);

    // console.log(hours);
    // console.log(minutes);

    if(hours < 10){
        hours = "0" + hours
    }else if(minutes < 10){
        minutes = "0" + minutes
    }
    
    // 12 Agustus 2022 09.04
    let fullTime = `${date} ${month[monthIndex]} ${year}`
    // console.log(fullTime);
    return fullTime
}

function getFullTime3(time){

    let month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    // console.log(date);
    // console.log(month[monthIndex]);
    // console.log(year);

    // console.log(hours);
    // console.log(minutes);

    if(hours < 10){
        hours = "0" + hours
    }else if(minutes < 10){
        minutes = "0" + minutes
    }

    if (date <10) {
        date = "0" + date
    }
    
    // 05 12 2022 09.04
    let fullTime = `${month[monthIndex]}/${date}/${year}`
    // console.log(fullTime);
    return fullTime
}

function getDistanceTime(time, end) {

    let timeNow= time // harus seperti ini karena manual dan karena pakai rumus template engine, bukan lagi dom javascript
    let timeEnd = end

    let distance = timeEnd - timeNow
    // console.log(distance);

    let milisecond = 1000 // 1 detik 1000 milisecond
    let secondInHours = 3600 // 1 jam sama dengan 3600 detik
    let hoursInDay = 24 // 1 hari 24 jam
    let dayInMonth = 31 // 1 bulan 31 hari
    let monthInYear = 12 // 1 tahun 12 bulan

    let distanceYear = Math.floor(distance / (milisecond * secondInHours * hoursInDay * dayInMonth * monthInYear))
    let distanceMonth = Math.floor(distance / (milisecond * secondInHours * hoursInDay * dayInMonth))
    let distanceDay = Math.floor(distance / (milisecond * secondInHours * hoursInDay))
    let distanceHours = Math.floor(distance / (milisecond * 60 * 60))
    let distanceMinutes = Math.floor(distance / (milisecond * 60))
    let distanceSeconds = Math.floor(distance / milisecond)

    if(distanceYear > 0){
        return `${distanceYear} Years`
    } else if (distanceMonth > 0){
        return `${distanceMonth} Month` 
    } else if (distanceDay > 0) {
        return `${distanceDay} Day`
    } else if(distanceHours > 0){
        return `${distanceHours} Hours`
    } else if(distanceMinutes > 0){
        return `${distanceMinutes} Minutes`
    } else {
        return `${distanceSeconds} Seconds`
    }
}

app.listen(port, () => { //menggunakan arrow function
    console.log(`Server running on port ${port}`);
})

// 11. atau bisa juga seperti ini 
// app.listen(port, function(){
//     console.log("Server running on port");
// })

// 12. git checkout -b day-6 utk membuat nama branch dari master ke day-6, guna utk memasukkan ke link repo all in one

// 13. template engine itu seperti framework juga, dan gunanya utk meminimalisir penggunaan connected, seperti tidak lagi menggunakan backtick di innerHeight.html nya

// cara install nodemon secara global meskipun udah di uninstall di package.json adalah
// dengan cara npm install -g nodemon # or using yarn: yarn global add nodemon, bisa dijalankan di semua terminal, baik git bash ataupun cmd, dan tinggal kita 
// kasih tambahan di start " nodemon node index.js " agar mendetect instalan global nodemon nya