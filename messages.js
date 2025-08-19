const backendUrl = 'https://included-touched-joey.ngrok-free.app';
const apiMessagesUrl = `${backendUrl}/api/messages`;
const widgetUrl = 'https://discord.com/api/guilds/1394823174226448524/widget.json';
let widgetData = null;
let displayedMessageIds = new Set();
let currentChannelId = getSelectedChannelId();
let currentChannelToken = Symbol();
let currentReactMessageId = null;
const requestQueue = [];
let isProcessingQueue = false;
const RATE_LIMIT_DELAY = 3000;
async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0) return;
    isProcessingQueue = true;
    while (requestQueue.length > 0) {
        const fn = requestQueue.shift();
        try { await fn(); } catch(err){ console.error(err); }
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY));
    }
    isProcessingQueue = false;
}
function enqueueRequest(fn){ requestQueue.push(fn); processQueue(); }
async function fetchWidget() {
    try { widgetData = await (await fetch(widgetUrl)).json(); } catch { widgetData = null; }
}
fetchWidget();
setInterval(fetchWidget, 30000);
function getSelectedChannelId(){ return document.getElementById('channelSelector').value; }
function getStatusImage(status){
    switch(status){
        case 'online': return 'https://codehs.com/uploads/32492fbd9c7975781bec905cc80efbde';
        case 'idle': return 'https://codehs.com/uploads/366cef0d856f621ae394ef8ca02c0807';
        case 'dnd': return 'https://codehs.com/uploads/ad7edef57db7e5c9eab58f45b9b8d7a4';
        default: return 'https://codehs.com/uploads/1837fc15433ac1289c3b36ec975fbc56';
    }
}
function getStatusTitle(status){
    switch(status){
        case 'online': return 'Online';
        case 'idle': return 'Idle';
        case 'dnd': return 'Do Not Disturb';
        default: return 'Offline';
    }
}
function getStatusFromWidget(globalName){
    if(globalName==='Dad Bot') return 'online';
    if(!widgetData?.members) return 'offline';
    const member = widgetData.members.find(m=>m.username===globalName||m.nick===globalName);
    return member?.status||'offline';
}
function renderTempMessage(content, type='text'){
    const list = document.getElementById('messages');
    const li = document.createElement('li');
    li.classList.add('temp-message');
    li.textContent = type==='text'?`Sending: ${content}...`:`Uploading: ${content}...`;
    list.prepend(li);
    return li;
}
async function renderMessage(msg, list){
    if(displayedMessageIds.has(msg.id)) return updateReactions(msg);
    const li = document.createElement('li');
    list.prepend(li);
    const avatarImg = document.createElement('img');
    avatarImg.classList.add('avatar');
    avatarImg.src = msg.author.avatar
        ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
    li.appendChild(avatarImg);
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    li.appendChild(contentDiv);
    const serverTag = msg.author.clan?.tag || '';
    const displayName = msg.author.global_name || msg.author.username;
    const statusColor = getStatusFromWidget(displayName);
    const statusTitle = getStatusTitle(statusColor);
    const timestamp = new Date(msg.timestamp).toLocaleString();
    let contentWithMentions = msg.content || '';
    if(msg.mentions?.length){
        msg.mentions.forEach(u=>{
            const name = u.global_name || u.username;
            contentWithMentions = contentWithMentions.replace(new RegExp(`<@!?${u.id}>`,'g'),`@${name}`);
        });
    }
    let contentHTML = `<strong>${displayName}</strong>
        <span style="margin-left:5px;color:#888;${serverTag?'border:1px solid white;border-radius:5px;padding:0 4px;':''}">${serverTag}</span>
        <img src="${getStatusImage(statusColor)}" title="${statusTitle}" style="width:16px;height:16px;margin-left:5px;vertical-align:middle;">
        <div>${contentWithMentions}</div>`;
    if(msg.attachments?.length){
        msg.attachments.forEach(att=>{
            const url = att.url, name = att.filename.toLowerCase();
            if(/\.(png|jpg|jpeg|gif|webp)$/.test(name)) contentHTML += `<br><img src="${url}" style="max-width:300px;">`;
            else contentHTML += `<br><a href="${url}" target="_blank" rel="noopener">${att.filename}</a>`;
        });
    }
    if(msg.referenced_message){
        const replyAuthor = msg.referenced_message.author;
        const replyDisplayName = replyAuthor.global_name || replyAuthor.username;
        const replyContent = msg.referenced_message.content || 'Attachment';
        contentHTML += `<div class="reply-box">Replying To <strong>${replyDisplayName}</strong>: ${replyContent}</div>`;
    }
    if(msg.reactions?.length){
        contentHTML += `<div class="reactions" style="margin-top:5px;">`;
        msg.reactions.forEach(r=>{
            contentHTML += `<span class="reaction-btn" data-id="${msg.id}" data-emoji="${r.emoji.name}">${r.emoji.name} ${r.count}</span>`;
        });
        contentHTML += `</div>`;
    }
    contentHTML += `<div class="timestamp">${timestamp}</div>
                    <br><span class="reaction-trigger" data-id="${msg.id}">React</span>`;
    contentDiv.innerHTML = contentHTML;
    displayedMessageIds.add(msg.id);
}
function updateReactions(msg){
    const li = document.querySelector(`.reaction-trigger[data-id="${msg.id}"]`)?.closest('li');
    if(!li) return;
    let reactionsHTML = '';
    if(msg.reactions?.length){
        reactionsHTML = `<div class="reactions" style="margin-top:5px;">`;
        msg.reactions.forEach(r => {
            reactionsHTML += `<span class="reaction-btn" data-id="${msg.id}" data-emoji="${r.emoji.name}">${r.emoji.name} ${r.count}</span>`;
        });
        reactionsHTML += `</div>`;
    }
    const oldReactions = li.querySelector('.reactions');
    if(oldReactions) oldReactions.replaceWith(new DOMParser().parseFromString(reactionsHTML,'text/html').body.firstChild);
    else li.querySelector('.content').insertAdjacentHTML('beforeend', reactionsHTML);
}
async function fetchMessages(token=currentChannelToken){
    const channelId = currentChannelId;
    const messagesList = document.getElementById('messages');
    try {
        const res = await fetch(`${apiMessagesUrl}?channelId=${channelId}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (!res.ok) throw new Error('Backend Unreachable');
        const data = await res.json();
        const sorted = data.sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
        for(const msg of sorted){
            if(token !== currentChannelToken) return;
            await renderMessage(msg, messagesList);
        }
    } catch(err){
        console.error(err);
        messagesList.innerHTML = '';
        const li = document.createElement('li');
        li.textContent = "Live Discord Chat Is Down Please Come Back Later";
        li.style.color = 'red';
        li.style.fontWeight = 'bold';
        messagesList.appendChild(li);
    }
}
setInterval(()=>enqueueRequest(()=>fetchMessages(currentChannelToken)),3000);
document.getElementById('channelSelector').addEventListener('change',()=>{
    currentChannelId = getSelectedChannelId();
    currentChannelToken = Symbol();
    displayedMessageIds.clear();
    document.getElementById('messages').innerHTML='';
    enqueueRequest(()=>fetchMessages(currentChannelToken));
});
const emojiPicker = document.getElementById('emojiPicker');
const discordEmojiRegex = /^(<a?:\w+:\d+>|[\p{Emoji_Presentation}\u200d]+)$/u;
document.body.addEventListener('click', e => {
    if (e.target.classList.contains('reaction-trigger')) {
        currentReactMessageId = e.target.dataset.id;
        const rect = e.target.getBoundingClientRect();
        emojiPicker.style.left = rect.left + 'px';
        emojiPicker.style.top = rect.bottom + 'px';
        emojiPicker.style.display = 'block';
    } else if (e.target.classList.contains('reaction-btn')) {
        const btn = e.target;
        if (btn.dataset.clicked) return;
        btn.dataset.clicked = 'true';
        const messageId = btn.dataset.id;
        const emoji = btn.dataset.emoji;
        if(!discordEmojiRegex.test(emoji)){
            alert('This Emoji Is Not Valid For Discord.');
            return;
        }
        fetch(`${backendUrl}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, emoji, channelId: currentChannelId })
        }).catch(err => console.error(err));
    } else if (!emojiPicker.contains(e.target)) emojiPicker.style.display = 'none';
});
emojiPicker.addEventListener('emoji-click', event => {
    const emoji = event.detail.unicode;
    if(!discordEmojiRegex.test(emoji)){
        alert('This Emoji Is Not Valid For Discord.');
        return;
    }
    const messageId = currentReactMessageId;
    const triggerBtn = document.querySelector(`.reaction-trigger[data-id="${messageId}"]`);
    if (triggerBtn.dataset.clicked) return;
    triggerBtn.dataset.clicked = 'true';
    fetch(`${backendUrl}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, channelId: currentChannelId })
    }).catch(err => console.error(err));
    emojiPicker.style.display = 'none';
});
const typingContainer = document.createElement('div');
typingContainer.id = 'typingIndicator';
typingContainer.style.display = 'none';
typingContainer.style.marginTop = '5px';
typingContainer.style.fontStyle = 'bold';
typingContainer.style.color = 'white';
typingContainer.style.fontSize = '14px';
typingContainer.innerHTML = `<span id="typingText"></span> <span class="dots"><span>.</span><span>.</span><span>.</span></span>`;
document.getElementById('sendForm').appendChild(typingContainer);
const typingText = document.getElementById('typingText');
const dots = typingContainer.querySelectorAll('.dots span');
let dotIndex = 0;
setInterval(() => {
    dots.forEach((d,i) => d.style.visibility = (i <= dotIndex ? 'visible' : 'hidden'));
    dotIndex = (dotIndex + 1) % 3;
}, 500);
let typingTimeout = null;
document.getElementById('msgInput').addEventListener('input', () => {
    const username = document.getElementById('nameInput').value.trim() || 'User';
    typingText.textContent = `${username} Is Typing`;
    typingContainer.style.display = 'block';
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingContainer.style.display = 'none';
    }, 5000);
});
document.getElementById('sendForm').addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    const message = document.getElementById('msgInput').value.trim();
    if(!name || !message) return;
    const tempLi = renderTempMessage(`${name}: ${message}`);
    document.getElementById('msgInput').value='';
    fetch(`${backendUrl}/send`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:`${name}: ${message}`, channelId:currentChannelId})
    }).then(()=>tempLi.remove())
      .catch(err=>{ tempLi.remove(); console.error(err); });
});
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileLabel = document.getElementById('fileLabel');
fileInput.addEventListener('change',()=>{ 
    fileLabel.textContent = fileInput.files.length>0 ? fileInput.files[0].name : 'Select A File'; 
});
uploadForm.addEventListener('submit', e=>{
    e.preventDefault();
    if(!fileInput.files.length) return alert('No File Selected');
    const tempLi = renderTempMessage(fileInput.files[0].name, 'file');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('channelId', currentChannelId);
    fetch(`${backendUrl}/upload`, {
        method:'POST',
        body:formData
    }).then(res=>{
        tempLi.remove();
        if(!res.ok) res.text().then(text=>alert('Upload Failed:'+text));
        fileInput.value=''; fileLabel.textContent='Select A File';
    }).catch(err=>{ tempLi.remove(); console.error(err); });
});
enqueueRequest(()=>fetchMessages(currentChannelToken));
