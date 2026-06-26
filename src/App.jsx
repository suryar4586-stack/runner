import React ,{useState,useEffect,useRef,useCallback} from 'react';
import './App.css';


const LANES=[0,1,2];
const LANE_COUNT=3;
const SPAWN_DISTANCE=1000;
const PLAYER_DISTANCE=80;
const REMOVE_DISTANCE=-50;
const JUMP_DURATION=480;
const  BASE_SPEED=6;
const MAX_SPEED=20;
const SPEED_RAMP_TIME=45000;

function distanceToTop(distance){
    const t=1- distance /SPAWN_DISTANCE;
    return 5 + t *78;
}
function distanceToScale(distance){
    const t=1 - distance /SPAWN_DISTANCE;
    return 0.45 + t*0.75;
}
export default function App(){
    const [screen,setScreen]=useState('start');

    const [lane,setLane]=useState(1);
    const [jumping,setJumping]=useState(false);
    const [score,setScore]=useState(0);
    const [coins,setCoins]=useState(0);
    const [speedDisplay,setSpeedDisplay]=useState(BASE_SPEED);
    const [finalScore,setFinalScore]=useState(0);
    const [finalCoins,setFinalCoins]=useState(0);

    const [,forceRender]=useState(0);

    const laneRef=useRef(1);
    const jumpingRef=useRef(false);
    const jumpingStartRef=useRef(0);
    const scoreRef=useRef(0);
    const coinsRef=useRef(0);
    const speedRef=useRef(BASE_SPEED);
    const startTimeRef=useRef(0);
    const lastSpawnobstalceRef=useRef(0);
    const lastSpawnCoinRef=useRef(0);
    const rafRef=useRef(null);
    const runningRef=useRef(false);

    const obstaclesRef=useRef([]);
    const coinsListRef=useRef([]);
    const idCounterRef=useRef(0);

    const moveLeft=useCallback(()=>{
        if(!runningRef.current)return;
        laneRef.current=Math.max(0,laneRef.current -1);
        setLane(laneRef.current);
    },[]);
      
    const moveRight=useCallback(()=>{
        if(!runningRef.current)return;
        laneRef.current=Math.min(LANE_COUNT -1 ,laneRef.current + 1);
        setLane(laneRef.current);
    },[]);
    const doJump=useCallback(()=>{
        if(!runningRef.current) return;
        if(jumpingRef.current) return;
        jumpingRef.current=true;
        jumpingStartRef.current=performance.now();
        setJumping(true);
        setTimeout(()=>{
            jumpingRef.current=false;
            setJumping(false);
        },JUMP_DURATION);
    },[]);

    useEffect(()=>{
        const handleKey=(e)=>{
            if(screen!=='playing')return;
            switch(e.key){
                case'ArrowLeft':
                case'a':
                case'A':
                 moveLeft();
                 break;
                case'ArrowRight':
                case'd':
                case'D':
                    moveRight();
                    break;
                case 'ArrowUp':
                case 'w':
                case'W':
                    e.preventDefault();
                    doJump();
                    break;
                default:
                    break;     
            }
        };
        window.addEventListener('keydown',handleKey);
        return()=>window.removeEventListener('keydown',handleKey);
    },[screen,moveLeft,moveRight,doJump]);

    const startGame=()=>{
        laneRef.current=1;
        jumpingRef.current=false;
        scoreRef.current=0;
        coinsRef.current=0;
        speedRef.current=BASE_SPEED;
        obstaclesRef.current=[];
        coinsListRef.current=[];
        idCounterRef.current=0;
        startTimeRef.current=performance.now();
        lastSpawnobstalceRef.current=performance.now();
        lastSpawnCoinRef.current=performance.now();


        setLane(1);
        setJumping(false);
        setScore(0);
        setCoins(0);
        setSpeedDisplay(BASE_SPEED);

        runningRef.current=true;
        setScreen('playing');
    };

    const endGame=()=>{
        runningRef.current=false;
        setFinalScore(Math.floor(scoreRef.current));
        setFinalCoins(coinsRef.current);
        setScreen('gameover');
    };

    useEffect(()=>{
        if(screen!=='playing')return;
        const loop=(now)=>{
            if(!runningRef.current)return;
            
            const elasped=now-startTimeRef.current;
            const rampT=Math.min(1,elasped/ SPEED_RAMP_TIME);
            speedRef.current=BASE_SPEED + rampT * (MAX_SPEED - BASE_SPEED);
            scoreRef.current+=speedRef.current* 0.5;

            obstaclesRef.current=obstaclesRef.current
            .map(o=>({...o,distance:o.distance - speedRef.current}))
            .filter(o=>o.distance > REMOVE_DISTANCE);
            
            coinsListRef.current=coinsListRef.current
            .map(c=>({...c,distance:c.distance - speedRef.current}))
            .filter(c=>c.distance > REMOVE_DISTANCE); 


            const obstalceInterval=Math.max(550,1400 -scoreRef.current * 0.8);
            if(now-lastSpawnobstalceRef.current > obstalceInterval){
               lastSpawnobstalceRef.current=now;
                const lane=Math.floor(Math.random() * LANE_COUNT);

                  obstaclesRef.current.push({
                    id:idCounterRef.current++,
                    lane,
                    distance:SPAWN_DISTANCE + 60,
                    kind:Math.random() > 0.5 ? 'cone':'barrier',
                });
            }
            const coinInterval=700;
            if(now-lastSpawnCoinRef.current > coinInterval){
                lastSpawnCoinRef.current=now;
                const lane=Math.floor(Math.random() * LANE_COUNT);
                coinsListRef.current.push({
                    id:idCounterRef.current++,
                    lane,
                    distance:SPAWN_DISTANCE + 60,
                });
            }
            const playerLane=laneRef.current;
            const isJumping=jumpingRef.current;
            for(const o of obstaclesRef.current){
                const sameLane=o.lane===playerLane;
                const nearPlayer=Math.abs(o.distance - PLAYER_DISTANCE) < 55;
                if(sameLane && nearPlayer && !isJumping){
                    endGame();
                    return;
                }
            }
            coinsListRef.current=coinsListRef.current.filter(c=>{
                const sameLane=c.lane===playerLane;
                const nearPlayer=Math.abs(c.distance - PLAYER_DISTANCE) < 55;
                if(sameLane && nearPlayer){
                    coinsRef.current +=1;
                    return false;
                }
                return true;
            });

            setScore(Math.floor(scoreRef.current));
            setCoins(coinsRef.current);
            setSpeedDisplay(speedRef.current);
            forceRender(n=> n+1);
            rafRef.current=requestAnimationFrame(loop);
        };
        rafRef.current=requestAnimationFrame(loop);
        return ()=>{
            if(rafRef.current)cancelAnimationFrame(rafRef.current);
        };
    },[screen]);

    const laneToLeftPercent=(laneIndex) =>{
        return[20,50,80][laneIndex];
    };
    if(screen==='start'){
        return (
            <div className="screen start-screen">
                <div className="title-glow">DASH RUNNER</div>
                <p className="subtitle">An original endless lane-runner</p>
                <div className="instructions">
                    <p>🏃 Run,dodge obstalces, and collect coins </p>
                    <p>⬅️ ➡️ Arrow Keys /A D -switch lanes</p>
                    <p>⬆️ Space / W -jump over obstacle</p>
                    <p>📱 On mobile,use the on-screen buttons</p>
                </div>
                <button className="primary-btn" onClick={startGame}>▶ Start Game</button>
            </div>
        );
    }
    if(screen==='gameover'){
        return(
            <div className="screen gameover-screen">
                <div className="gameover-card">
                    <div className="gameover-title">💥 Game Over</div>
                    <span>Final Score</span>
                    <strong>{finalScore}</strong>
                </div>
                     <div className="start-row">
                        <span> Coins Collected</span>
                        <strong>🪙 {finalCoins}</strong>
                     </div>
                     <button className="primary-btn" onClick={startGame}> ↻ Restart</button>
            </div>
        );
    }
    return (
        <div className="screen game-screen">
            <div className="hud">
                <div className="lane-line" style={{left:'33.33%'}}/>
                <div className="lane-line" style={{left:'66.66%'}}/>

                {obstaclesRef.current.map(o=>(
                    <div
                    key={o.id}
                    className={`obstacle ${o.kind}`}
                    style={{
                        left:`${laneToLeftPercent(o.lane)}%`,
                        top:`${distanceToTop(o.distance)}%`,
                        transform:`translate(-50%,-50%) scale(${distanceToScale(o.distance)})`,
                    }}
                    />
                ))}

                {coinsListRef.current.map(c=>(
                    <div 
                    key={c.id}
                    className="coin"
                    style={{left:`${laneToLeftPercent(c.lane)}%`,
                    top:`${distanceToTop(c.distance)}%`,
                    transform:`translate(-50%,-50%) scale(${distanceToScale(c.distance)})`,
                }}
                />
                ))}
                <div className={`player ${jumping ? 'jumping':''}`}
                style={{left:`${laneToLeftPercent(lane)}%`}}>
                    <div className="player-body"/>
                    <div className="player-shadow"/>
                </div>
            </div>
            <div className="touch-controls">
                <button className="touch-btn" onTouchStart={moveLeft} onClick={moveLeft}>⬅</button>
                <button className="touch-btn jump-btn" onTouchStart={doJump} onClick={doJump}>⬆</button>
                <button className="touch-btn" onTouchStart={moveRight} onClick={moveRight}>➡</button>
            </div>
            
        </div>
    );
}