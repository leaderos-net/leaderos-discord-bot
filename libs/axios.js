const axios = require('axios');
const config = require("../config.js");

const instance = axios.create({
    baseURL: config.general.wesiteUrl,
    headers: {'x-api-key': config.general.apiKey}
})

module.exports.sendMessage = async(ticketID, accountID, isStaff, message) => {
    await instance.post("/api/support/tickets/"+ticketID+"/messages", {
        userID: accountID,
        message: message,
        isAdmin: isStaff.toString()
    }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
module.exports.closeTicket = async(ticketID) => {
    await instance.get('/api/support/tickets/'+ticketID+'/close')
}
module.exports.getSettings = async() => {
    const { data } = await instance.get("/api/integrations/discord/settings")
    return data
}
module.exports.getUserInfo = async(discordUserID) => {
    await instance.get("/api/integrations/discord/users/"+discordUserID).then(function (response) {
        return response
    }).catch(function (error) {
        return false;
    });
}
