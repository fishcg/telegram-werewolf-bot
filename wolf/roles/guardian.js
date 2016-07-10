'use strict'

const Role = require('./role');

class Guardian extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'guardian';
    this.name = this.symbol() + 'Guardian';
    this.priority = 3;

    this.allowEvents = [ 'vote', 'protect' ];
  }
  
  action(ev, target) {
    console.log('action', ev, target.username);
    if (ev === 'protect') {
      target.role.addBuff('guard', 1);
    }
  }
  
  eventAnnouncement() {
    var msg = 'You are a guardian, you can protect someone from the wolf in night.';
    
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: msg
    }, (err, r) => {
      if (err) console.log(err);
    });
  }
  
  eventNight() {
    let players = this.wolf.players;
    let keyboard = [];

    for (var u of players) {
      var pname = this.wolf.format_name(u);
      // \/[evname] [user_id] [chat_id]
      keyboard.push([{
        text: pname,
        callback_data: this.makeCommand('protect', u.id, this.chat_id)
      }]);
    }

    // skip
    keyboard.push([{
      text: 'Skip',
      callback_data: this.makeCommand('protect', 0, this.chat_id)
    }]);

    var self = this;
    this.protect_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: 'This night, do you want to protect someone?',
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }),
    }, (err, r) => {
      if (err) {
        console.log(err);
      } else {
        self.protect_message_id = r.message_id;
      }
    });
  }
  
  nightTimeUp() {
    if (this.protect_message_id) {
      this.ba.editMessageText({
        chat_id: this.user_id,
        message_id: this.protect_message_id,
        text: 'Timeup!'
      });
    }
  }
  
  eventNightCallback(queue, upd, data) {
    super.eventNightCallback(queue, upd, data);

    // update message
    let cq = upd.callback_query;
    this.ba.editMessageText({
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: 'Selected - ' + data.name
    });
  }
};

module.exports = Guardian;
