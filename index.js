const express = require('express');
const app = express();
const cors = require('cors');
const port = 5500;
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const positions = [0,100,80,70,50,0,0,0];
const members1 = fs.readFileSync("E:/projects/cricBackend/user.js");
const members = JSON.parse(Buffer.from(members1).toString());



app.get('/viewAll', (req, res) => {
    console.log(members)
    res.json(members);
});

app.get('/addAmount/:person/:position', (req, res) => {
    console.log('Reached')
    const { person, position } = req.params;
    const matchesPlayed = members[0].winnings;
    if(position > 4){
        res.end('Fail')
    }
    const member = members.find(m => m.name.toLowerCase() == person.toLowerCase());
    
    if (member) {
        member.winnings += parseInt(positions[position]);
        member.earnings = member.winnings - matchesPlayed * 50;
        const _wData = JSON.stringify(members)
        fs.writeFileSync("E:/projects/cricBackend/user.js", _wData);
        res.json({ success: true, members });
    } else {
        res.status(404).json({ success: false, message: 'Member not found' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/addMatch', (req, res) => {
    members[0].winnings = members[0].winnings + 1;
    const _wData = JSON.stringify(members)
    fs.writeFileSync("E:/projects/cricBackend/user.js", _wData);
    res.end("total Matches palyed: members[0].winnings");
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
