const express = require('express'); 
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.post('/split-payments/compute', async (req, res) => {
    const {ID, Amount, SplitInfo } = req.body
    balance = Amount
    const split = SplitInfo
    sum = 0
    totalRatio = []
    SplitBreakdown = []
    try {
        for(var i in split) {
            if(split[i].SplitType === 'FLAT'){
                balance = balance - split[i].SplitValue
                // console.log(`${SplitInfo[i].SplitEntityId}: ${balance}`)
                SplitBreakdown.push({
                  SplitEntityId: split[i].SplitEntityId,
                  Amount: split[i].SplitValue
                })
            }
            
        }
        for(var i in split) {
            if(split[i].SplitType === 'PERCENTAGE') {
                percent = (split[i].SplitValue * balance) / 100
                balance = (balance - (percent))
                SplitBreakdown.push({
                  SplitEntityId: split[i].SplitEntityId,
                  Amount: percent
                })
                // console.log(SplitBreakdown)
            }
        }
        for(var i in split) {
            if(split[i].SplitType === 'RATIO') {
                sum += split[i].SplitValue
            }
        }
        for(var i in split) {
            if(split[i].SplitType === 'RATIO') {
                totalRatio.push(split[i].SplitValue)
                ratioSplit = totalRatio.map((item) => {
                    ratio = (item / sum) * balance
                    return ratio
                })
            }
        }
        for( var i in ratioSplit) {
            SplitBreakdown.push({
              SplitEntityId: split[i].SplitEntityId,
              Amount: ratioSplit[i]
            })
            
            balance = (balance - ratioSplit[i])
        }

        res.send({
            ID: ID,
            Balance: balance,
            SplitInfo: SplitBreakdown
        })
    } catch (error) {
        const message = error.message
        res.status(500).json({message})
    }
})