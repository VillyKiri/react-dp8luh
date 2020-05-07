import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
const pngHeader = 'data:image/png;base64,';
let interval;

const settings = {
    livenessIR: false,
    livenessDepth: false,
    livenessEyes: true,
    checkEyes: true,
    margin: 50,
    minWidth: 80,
    minHeight: 110,
    blurThreshold: 0.8,
    // In upcoming release
    // gazeThreshold: 1,
    rotationThreshold: 10,
    suspiciousThreshold: 0.5, // Percentage, more is stricter
    lightThreshold: 0.9,
    darkThreshold: 0.8,
    mouthThreshold: 0.8,
    showDetection: true,
    colorGood: [0, 255, 0],
    colorBad: [255, 0, 0],
    lineThickness: 3,
};

const states = {
    occluded: 'прикрыт',
    smile: 'улыбка',
    overlap: 'перекрыт',
    open: 'открыт\\ы',
    closed: 'закрыт',
    unknown: 'неизвестен',
    normal: 'нейтральный',
};

const funcs = [
    // gotBestshot: 'Получен биометрический образец',
    ['cameraModel', 'Модель камеры'],
    ['detectionsCount', 'Количество лиц в кадре'],
    ['notFrontal', 'Нефронтальная поза'],
    ['tooDark', 'Слишком тёмное изображение'],
    ['tooLight', 'Слишком яркое изображение'],
    ['tooSmall', 'Слишком далеко от камеры'],
    ['cropped', 'Слишком близко к краям экрана'],
    // ['grayscale', 'Черно-белое изображение'],
    ['suspicious', 'Подозрительное поведение'],
    ['tooBlurry', 'Изображение смазано'],
    ['pitch', 'Угол склонения головы'],
    ['roll', 'Угол наклона головы к плечам'],
    ['yaw', 'Угол поворота головы'],
    ['glasses', 'Очки'],
    ['eyes', ['Статус обоих глаз', states]],
    ['leftEye', ['Статус левого глаза', states]],
    ['rightEye', ['Статус правого глаза', states]],
    ['mouth', ['Статус рта', states]],
    ['detection', 'Детекция'],
];
/*const messagesElement = document.getElementById('messagesElement');
const bestshot = document.getElementById('bestshot');
const frame = document.getElementById('frame');
const subcontainer = document.getElementById('subcontainer');
const activex = document.createElement('object');
*/
const messagesElement = {
    text: 'Передаваемый текст1',
};
// END CONSTANTS

function MessagesElement(pops){
	return (
		<div className = "messagesElement">
			{pops.text}
		</div>
	);
}

function BrowserIE() {
    if (isBrowserIE)
       return (
          		<div className = "messagesElement">
			          Для открытия шаблона необходимо используйте Internet Explorer 11
		          </div>);
    return false;          

}

function isBrowserIE() {
    const userAgent = navigator.userAgent.toLowerCase();
    if ((/mozilla/.test(userAgent) && !/firefox/.test(userAgent)
        && !/chrome/.test(userAgent) && !/safari/.test(userAgent)
        && !/opera/.test(userAgent)) || /msie/.test(userAgent)) {
        return true;
    }
    else return false;
}

function start() {
    if (!isBrowserIE()) {
        messagesElement.innerHTML = 'Для открытия шаблона необходимо используйте Internet Explorer 11';
        return;
    }
    try {
        const obj = new ActiveXObject('VisionLabs.PhotoMaker');
    } catch (err) {
        messagesElement.innerHTML = 'Невозможно подключить библиотеку для создания фото';
        return;
    }
    const activex = document.createElement('object');
    activex.id = 'activex';
    activex.type = 'application/x-photomaker';
    activex.width = 640;
    activex.height = 480;
    containerobj.appendChild(activex);
    
    activex.setUp(JSON.stringify(settings));
    activex.start();
    interval = setInterval(update, 250);
}
function reset() {
    if (subcontainer.contains(frame)) subcontainer.removeChild(frame)
    messagesElement.innerHTML = '';
    activex.style.display = 'block';
    activex.reset();
    interval = setInterval(update, 250);
}
function update() {
    let data = JSON.parse(activex.getResult());
    if (data.gotBestshot) {
        window.clearInterval(interval);
        bestshot.src = pngHeader + activex.getBestshot();
        frame.src = pngHeader + activex.getBestFrame();
        activex.style.display = 'none';
        messagesElement.innerHTML = '';
        subcontainer.insertBefore(frame, messagesElement);
        messagesElement.appendChild(bestshot);
        messagesElement.appendChild(reset);
    } else
        displayMessages(data);
}

function appendMessage(label, value) {
    let endLabel = label;
    let endValue = value;
    if (!(value === null) && !(value === false)) {
        const messageElement = document.createElement('div');
        if (typeof label === 'object') {
            [endLabel] = label;
            endValue = label[1][value] || value;
        }
        else if (typeof value === 'boolean') endValue = '';
        else if (typeof value === 'number' && label !== 'Количество лиц в кадре' && value > 1) endValue = value.toPrecision(4);
        else if (label === 'Детекция') {
            endValue = '';
            endLabel = `x: ${value.x} y: ${value.y} ширина: ${value.width} высота: ${value.height}`;
        }
        messageElement.className = 'messageElement';
        messageElement.innerHTML = `<div> ${endLabel} </div><div> ${endValue} </div>`;
        messagesElement.appendChild(messageElement);

    }
}

function displayMessages(messages) {
    messagesElement.innerHTML = '';
    if (messages.cameraModel === '') {
        messagesElement.innerHTML = 'Инициализация камеры';
        return;
    }
    if (messages.suspicious) {
        messagesElement.innerHTML = 'Подозрительное поведение';
        messagesElement.appendChild(reset);
        clearInterval(interval);
        return;
    }
    funcs.forEach(function (entry) {
        appendMessage(entry[1], messages[entry[0]]);
    });
}

const INTERVAL = 100;
export default class MyBioFullscreen extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
        value: 0, 
        messagesElement: "Предварительный текст"};
      this.onClickStart = this.onClickStart.bind(this);
     
    }

    increment(){
      this.setState({value: this.state.value + 1});
    }

    componentDidMount() {
      const Activex = document.getElementById('Activex');
      //Activex.setUp("");
       
      this.timerID = setInterval(() => this.increment(), 1000/INTERVAL);
    }

    componentWillUnmount() {
      clearInterval(this.timerID);
    }
    onClickStart() {
     /* this.setState(prevState => ({
        temperature: prevState.temperature + 1
      }))*/
        this.setState({ 
        messagesElement : "Ki"
      });
   
    }


    render() {
        return (
            <div>
                <button id="start" type="submit" onClick={this.onClickStart}>Start</button>
                <button id="reset" type="submit" onClick={reset}>Reset</button>
				
                <div className="container">
                    <div id="subcontainer">
                                <object
                id="Activex"
                type="application/x-photomaker"
                width="640"
                height="480"></object>
                        <div id="containerobj" />
                        <BrowserIE/>
                        <MessagesElement text={this.state.messagesElement}/>
                    </div>
                    {this.state.value}
                </div>
                <img id="bestshot" alt="" />
                <img id="frame" alt="" />
                <div id="isLoadedElement" />
                <div id="container" />
            </div>
        );
    }
}

ReactDOM.render(
  <MyBioFullscreen/>,
  document.getElementById('root')

  )


