const express = require('express');
const app = express();
const server = require('http').createServer(app);
const axios = require('axios');
const qs = require('qs');
const request = require('request');
const session = require('express-session');
const config = require('./config.js');
const cors = require('cors'); // 모듈추가


const client_id = config.client_id;
const redirect_uri = 'http://localhost:3000/login_success';
const token_uri = 'https://kauth.kakao.com/oauth/token';
const api_host = "https://kapi.kakao.com";

app.use(session({
    secret: config.session_key,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(cors()); //사용


app.get('/message', (req, res) => {
    res.sendFile(__dirname+'/message.html')
})

async function call(method, uri, param, header) {
    try {
        resp = await axios({
            method: method,
            url: uri,
            headers: header,
            data: param
        })
    } catch (error) {
        resp = err.response;
    }
    return resp.data;
}

app.get('/auth', (req, res) => {
    console.log("들어오나");
  
    res.redirect(`https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`);
})

app.get('/login_success', async (req, res) => {
    const obj = {
        method: 'POST',
        url: token_uri,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: client_id,
        redirect_url: redirect_uri,
        code: req.query.code,
        }),
    }
    try {
        const respToken = await axios(obj);
        req.session.key = respToken.data.access_token;
        res.redirect('/main');
    } catch(e){
        console.log('error');
    }
});

app.get('/main', (req, res) => {
    res.sendFile(__dirname+'/main.html');
})

app.get('/send_message/me', (req, res) => {
    const token = req.session.key;
    const webUrl = 'http://www.eveningbread.com/';
    try {
        request({
        uri: 'https://kapi.kakao.com/v2/api/talk/memo/default/send', 
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        },
        form: {
            template_object: JSON.stringify({
            object_type: 'feed',
            content: {
                title: '갓 구운 빵처럼 맛있게 구워드립니다 "맛있는 ICT 기술"',
                description: '사용자 경험이 무엇보다 중요한 모바일 환경에서 이브닝브레드의 UX/UI 설계 능력은 고객에게 더 나은 경험을 제공합니다.',
                image_url: 'http://k.kakaocdn.net/dn/Q2iNx/btqgeRgV54P/VLdBs9cvyn8BJXB3o7N8UK/kakaolink40_original.png',
                link: {
                    mobileWebUrl: webUrl,
                    webUrl: webUrl,
                },
            },
            buttons: [{
                title: '자세히보기',
                link: {
                mobileWebUrl: webUrl,
                webUrl: webUrl,
                },
            },],
            })
        }
        }, (err, r) => {
        console.log(r.body); // result_code가 0이면 성공
        });
        res.send('success');
    } catch(e) {
        console.log('error');
    }
})
//http://localhost:3000/auth
server.listen(3000, ()=>{
    console.log('서버 동작중...');
});



