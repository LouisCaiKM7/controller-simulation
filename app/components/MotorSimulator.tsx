'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: number;
  desired: number;
  actual: number;
}

export default function MotorSimulator() {
  const [pidEnabled, setPidEnabled] = useState(false);
  const [ffEnabled, setFfEnabled] = useState(false);
  const [desiredOutput, setDesiredOutput] = useState(50); // Percentage 0-100
  const [sliderStep, setSliderStep] = useState(1); // Slider step size
  const [currentOutput, setCurrentOutput] = useState(0);
  const [motorVoltage, setMotorVoltage] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  
  // PID parameters
  const [kP, setKP] = useState(0);
  const [kI, setKI] = useState(0);
  const [kD, setKD] = useState(0);
  
  // PID parameter bounds
  const [kPMax, setKPMax] = useState(1);
  const [kIMax, setKIMax] = useState(0.1);
  const [kDMax, setKDMax] = useState(0.5);
  
  // FF parameters
  const [kS, setKS] = useState(0); // Static friction
  const [kV, setKV] = useState(0); // Velocity
  const [kA, setKA] = useState(0); // Acceleration
  
  // FF parameter bounds
  const [kSMax, setKSMax] = useState(1);
  const [kVMax, setKVMax] = useState(2);
  const [kAMax, setKAMax] = useState(1);
  
  // Graph data
  const [graphData, setGraphData] = useState<DataPoint[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // PID state
  const integral = useRef(0);
  const lastError = useRef(0);
  const lastVelocity = useRef(0);
  
  const MAX_VOLTAGE = 12;
  const SIMULATION_RATE = 50; // ms
  const MAX_DATA_POINTS = 100;

  useEffect(() => {
    const interval = setInterval(() => {
      const targetOutput = desiredOutput;
      const error = targetOutput - currentOutput;
      
      // Calculate velocity and acceleration from setpoint changes
      const dt = SIMULATION_RATE / 1000;
      const setpointVelocity = (targetOutput - lastVelocity.current) / dt;
      const setpointAcceleration = (setpointVelocity - velocity) / dt;
      
      let voltage = 0;
      
      // Feedforward control with kS, kV, kA
      if (ffEnabled) {
        // kS: Static friction - constant voltage to overcome friction when motor needs to hold position
        // Applied when there's an error (motor needs to move or hold)
        const staticComponent = Math.abs(error) > 0.5 ? Math.sign(error) * kS * MAX_VOLTAGE : 0;
        
        // kV: Velocity feedforward - voltage proportional to error (how fast we need to move)
        // This drives the motor toward the setpoint
        const velocityComponent = kV * error;
        
        // kA: Acceleration feedforward - helps with rapid setpoint changes
        const accelComponent = kA * setpointVelocity;
        
        voltage += staticComponent + velocityComponent + accelComponent;
      }
      
      // PID control
      if (pidEnabled) {
        integral.current += error * dt;
        const derivative = (error - lastError.current) / dt;
        
        voltage += kP * error + kI * integral.current + kD * derivative;
        lastError.current = error;
      }
      
      // Clamp voltage to ±12V
      voltage = Math.max(-MAX_VOLTAGE, Math.min(MAX_VOLTAGE, voltage));
      
      // More realistic motor model with damping
      // Motor equation: velocity change is proportional to voltage minus friction/damping
      const motorConstant = 0.15; // How quickly motor responds to voltage
      const dampingConstant = 0.08; // Natural damping/friction
      
      const velocityChange = (voltage * motorConstant - velocity * dampingConstant) * dt;
      const newVelocity = velocity + velocityChange;
      const newOutput = currentOutput + newVelocity * dt;
      const clampedOutput = Math.max(0, Math.min(100, newOutput));
      
      // Update graph data
      setTimeElapsed(prev => {
        const newTime = prev + dt;
        setGraphData(prevData => {
          const newData = [...prevData, {
            time: newTime,
            desired: targetOutput,
            actual: clampedOutput
          }];
          return newData.slice(-MAX_DATA_POINTS);
        });
        return newTime;
      });
      
      setCurrentOutput(clampedOutput);
      setMotorVoltage(voltage);
      setVelocity(newVelocity);
      setAcceleration(velocityChange / dt);
      lastVelocity.current = targetOutput;
    }, SIMULATION_RATE);
    
    return () => clearInterval(interval);
  }, [pidEnabled, ffEnabled, desiredOutput, currentOutput, kP, kI, kD, kS, kV, kA, velocity, timeElapsed]);
  
  // Reset integral when PID is disabled
  useEffect(() => {
    if (!pidEnabled) {
      integral.current = 0;
      lastError.current = 0;
    }
  }, [pidEnabled]);
  
  // Reset function
  const resetSimulation = () => {
    setCurrentOutput(0);
    setMotorVoltage(0);
    setVelocity(0);
    setAcceleration(0);
    setGraphData([]);
    setTimeElapsed(0);
    integral.current = 0;
    lastError.current = 0;
    lastVelocity.current = 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Motor Output Simulator
      </h1>
      
      {/* Control Mode Toggles */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Control Modes</h2>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Reset Simulation
          </button>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pidEnabled}
              onChange={(e) => setPidEnabled(e.target.checked)}
              className="w-6 h-6 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-lg text-white font-medium">PID Control</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ffEnabled}
              onChange={(e) => setFfEnabled(e.target.checked)}
              className="w-6 h-6 rounded bg-slate-700 border-slate-600 text-green-500 focus:ring-green-500"
            />
            <span className="text-lg text-white font-medium">Feedforward Control</span>
          </label>
        </div>
      </div>
      
      {/* Desired Output Control */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-4">Desired Output</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step={sliderStep}
              value={desiredOutput}
              onChange={(e) => setDesiredOutput(Number(e.target.value))}
              className="flex-1 h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="0"
              max="100"
              step={sliderStep}
              value={desiredOutput}
              onChange={(e) => setDesiredOutput(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-20 px-2 py-1 text-xl font-bold text-white bg-slate-700 border border-slate-600 rounded text-right"
            />
            <span className="text-xl font-bold text-white">%</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300">Step size:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="step"
                checked={sliderStep === 0.1}
                onChange={() => setSliderStep(0.1)}
                className="w-4 h-4"
              />
              <span className="text-white">0.1</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="step"
                checked={sliderStep === 1}
                onChange={() => setSliderStep(1)}
                className="w-4 h-4"
              />
              <span className="text-white">1</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="step"
                checked={sliderStep === 5}
                onChange={() => setSliderStep(5)}
                className="w-4 h-4"
              />
              <span className="text-white">5</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="step"
                checked={sliderStep === 10}
                onChange={() => setSliderStep(10)}
                className="w-4 h-4"
              />
              <span className="text-white">10</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Motor Output Display */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-4">Motor Status</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-slate-300">Current Output</span>
              <span className="text-2xl font-bold text-blue-400">
                {currentOutput.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-8">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-8 rounded-full transition-all duration-100 flex items-center justify-end pr-2"
                style={{ width: `${currentOutput}%` }}
              >
                {currentOutput > 10 && (
                  <span className="text-white font-semibold text-sm">
                    {currentOutput.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-slate-300">Motor Voltage</span>
              <span className="text-2xl font-bold text-green-400">
                {motorVoltage.toFixed(2)}V
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-8 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm z-10">
                  Max: ±{MAX_VOLTAGE}V
                </span>
              </div>
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-8 rounded-full transition-all duration-100"
                style={{ 
                  width: `${Math.abs(motorVoltage) / MAX_VOLTAGE * 50}%`,
                  marginLeft: motorVoltage >= 0 ? '50%' : `${50 - Math.abs(motorVoltage) / MAX_VOLTAGE * 50}%`
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <span className="text-lg text-slate-300">Error</span>
            <span className="text-xl font-bold text-orange-400">
              {(desiredOutput - currentOutput).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Output Graph */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Output Over Time
          <span className="text-sm text-slate-400 ml-2">({graphData.length} data points)</span>
        </h2>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer>
            <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8"
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis 
                stroke="#94a3b8"
                label={{ value: 'Output (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => value.toFixed(2) + '%'}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="desired" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
                name="Desired Output"
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Actual Output"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {graphData.length === 0 && (
          <p className="text-center text-slate-400 mt-4">
            Graph will populate as simulation runs...
          </p>
        )}
      </div>
      
      {/* PID Tuning */}
      {pidEnabled && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">PID Parameters</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-slate-300">kP (Proportional)</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{kP.toFixed(3)}</span>
                  <span className="text-slate-400 text-sm">/ Max:</span>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={kPMax}
                    onChange={(e) => setKPMax(Math.max(0.1, Number(e.target.value)))}
                    className="w-16 px-1 py-0.5 text-sm text-white bg-slate-600 border border-slate-500 rounded"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={kPMax}
                step={kPMax / 1000}
                value={kP}
                onChange={(e) => setKP(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-slate-300">kI (Integral)</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{kI.toFixed(3)}</span>
                  <span className="text-slate-400 text-sm">/ Max:</span>
                  <input
                    type="number"
                    min="0.01"
                    max="5"
                    step="0.01"
                    value={kIMax}
                    onChange={(e) => setKIMax(Math.max(0.01, Number(e.target.value)))}
                    className="w-16 px-1 py-0.5 text-sm text-white bg-slate-600 border border-slate-500 rounded"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={kIMax}
                step={kIMax / 1000}
                value={kI}
                onChange={(e) => setKI(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-slate-300">kD (Derivative)</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{kD.toFixed(3)}</span>
                  <span className="text-slate-400 text-sm">/ Max:</span>
                  <input
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={kDMax}
                    onChange={(e) => setKDMax(Math.max(0.1, Number(e.target.value)))}
                    className="w-16 px-1 py-0.5 text-sm text-white bg-slate-600 border border-slate-500 rounded"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={kDMax}
                step={kDMax / 1000}
                value={kD}
                onChange={(e) => setKD(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* FF Tuning */}
      {ffEnabled && (
        <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">Feedforward Parameters</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-slate-300">kS (Static Friction)</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{kS.toFixed(2)}</span>
                  <span className="text-slate-400 text-sm">/ Max:</span>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={kSMax}
                    onChange={(e) => setKSMax(Math.max(0.1, Number(e.target.value)))}
                    className="w-16 px-1 py-0.5 text-sm text-white bg-slate-600 border border-slate-500 rounded"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={kSMax}
                step={kSMax / 100}
                value={kS}
                onChange={(e) => setKS(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-slate-300">kV (Velocity)</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{kV.toFixed(2)}</span>
                  <span className="text-slate-400 text-sm">/ Max:</span>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={kVMax}
                    onChange={(e) => setKVMax(Math.max(0.1, Number(e.target.value)))}
                    className="w-16 px-1 py-0.5 text-sm text-white bg-slate-600 border border-slate-500 rounded"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={kVMax}
                step={kVMax / 100}
                value={kV}
                onChange={(e) => setKV(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-slate-300">kA (Acceleration)</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{kA.toFixed(2)}</span>
                  <span className="text-slate-400 text-sm">/ Max:</span>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={kAMax}
                    onChange={(e) => setKAMax(Math.max(0.1, Number(e.target.value)))}
                    className="w-16 px-1 py-0.5 text-sm text-white bg-slate-600 border border-slate-500 rounded"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={kAMax}
                step={kAMax / 100}
                value={kA}
                onChange={(e) => setKA(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
