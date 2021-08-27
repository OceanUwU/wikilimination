const socket = io('');

const url = article => `https://en.wikipedia.org/?curid=${article.id}`;
const rows = 4;
const columns = 5;

var articleShown = false;
var gameInfo = null;

switch (queryParams.intent) {
    case 'create':
        socket.emit('create');
        break;
        
    case 'join':
        socket.emit('join', queryParams.code);
        break;
        
    default:
        window.location.reload();
}

socket.on('wait', code => {
    $('#wait').removeClass('d-none');
    $('#roomCode').text(code);
});

socket.on('loading', () => {
    $('#wait').addClass('d-none');
    $('#load').removeClass('d-none');
});

socket.on('start', info => {
    console.log(info)
    gameInfo = info;

    $('#load').addClass('d-none');
    $('#game').removeClass('d-none');

    $('#code').text(gameInfo.code);

    toggleArticle();
    let link = $('#myArticle').find('a');
    let article = gameInfo.articles[gameInfo.article];
    link.text(article.title);
    link.attr('href', url(article));

    let board = gameInfo.boards[gameInfo.place];
    for (let i = 0; i < rows; i++) {
        let row = $('<tr>');
        for (let j = 0; j < columns; j++) {
            let pos = columns * i + j;
            let article = gameInfo.articles[board[pos]];

            let cell = $('<td>');
            console.log(board[pos]);
            cell.attr('id', `own${board[pos]}`);
            cell.click(() => console.log('flip', board[pos]));
            cell.click(() => socket.emit('flip', board[pos]));
            let div = $('<div>');
            let link = $('<a>');
            link.attr('target', '_blank');
            link.attr('href', url(article));
            link.text(article.title);

            div.append(link);
            cell.append(div)
            row.append(cell);
        }
        $('#ownBoard').append(row);
    }

    let opponentBoard = gameInfo.boards[Number(!Boolean(gameInfo.place))];
    for (let i = 0; i < rows; i++) {
        let row = $('<tr>');
        for (let j = 0; j < columns; j++) {
            let pos = columns * i + j;
            let cell = $('<td>');
            cell.attr('id', `opponent${opponentBoard[pos]}`);
            row.append(cell);
        }
        $('#opponentBoard').append(row);
    }

    for (let flipped in gameInfo.flipped) {
        for (let pos in gameInfo.flipped[flipped]) {
            flip(flipped == gameInfo.place, pos, gameInfo.flipped[flipped][pos]);
        }
    }
});

socket.on('flip', (place, pos, flipped) => flip(place == gameInfo.place, pos, flipped));

socket.on('err', err => window.location.href = `/?err=${err}`);



function toggleArticle() {
    articleShown = !articleShown;
    $('#toggleArticle').find('img').attr('src', `/static/img/eye${articleShown ? '-slash' : ''}.svg`);
    $('#myArticle').css('background', articleShown ? '' : 'black')
}

function flip(mine, pos, flipped) {
    let cell = $(`#${mine ? 'own' : 'opponent'}${pos}`);
    cell.removeClass(flipped ? 'unflipped' : 'flipped');
    cell.addClass(flipped ? 'flipped' : 'unflipped');
}