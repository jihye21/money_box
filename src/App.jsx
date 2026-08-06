import React, { useState } from 'react';
import { Plus, TrendingUp, Calendar as CalendarIcon, Target, Flag, Zap, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
  , ReferenceLine
 } from 'recharts';
import './App.css';

export default function App() {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'goals'
  
  // 일간
  const dailyData = [
    { date: '월', actual: 15000, target: 15000, diff: 0, base: 15000, surplus: 0, deficit: 10000 },
    { date: '화', actual: 22000, target: 15000, diff: 7000, base: 15000, surplus: 7000, deficit: 0 },
    { date: '수', actual: 10000, target: 15000, diff: -5000, base: 10000, surplus: 0, deficit: 0 },
    { date: '목', actual: 18000, target: 15000, diff: 3000, base: 15000, surplus: 3000, deficit: 0 },
    { date: '금', actual: 15000, target: 15000, diff: 0, base: 15000, surplus: 0, deficit: 0 },
    { date: '토', actual: 12000, target: 15000, diff: -3000, base: 12000, surplus: 0, deficit: 0 },
    { date: '일', actual: 20000, target: 15000, diff: 5000, base: 15000, surplus: 5000, deficit: 0 },
    ];

  // 주간
  const weeklyData = [
    { period: '1주차', actual: 90000, target: 100000, diff: -10000, base: 90000, surplus: 0, deficit: 0 },
    { period: '2주차', actual: 110000, target: 100000, diff: 10000, base: 100000, surplus: 10000, deficit: 0 },
    { period: '3주차', actual: 70000, target: 100000, diff: -30000, base: 70000, surplus: 0, deficit: 0 },
    { period: '4주차', actual: 130000, target: 100000, diff: 30000, base: 100000, surplus: 30000, deficit: 0 },
    { period: '5주차', actual: 100000, target: 100000, diff: 0, base: 100000, surplus: 0, deficit: 0 },
    ];

  // 월간
  const monthlyData = [
    { period: '1월', actual: 2000000, target: 2000000, diff: 0, base: 2000000, surplus: 0, deficit: 0 },
    { period: '2월', actual: 2200000, target: 2000000, diff: 200000, base: 2000000, surplus: 200000, deficit: 0 },
    { period: '3월', actual: 2000000, target: 2000000, diff: 0, base: 2000000, surplus: 0, deficit: 0 },
    { period: '4월', actual: 1900000, target: 2000000, diff: -100000, base: 1900000, surplus: 0, deficit: 0 },
    { period: '5월', actual: 2300000, target: 2000000, diff: 300000, base: 2000000, surplus: 300000, deficit: 0 },
    { period: '6월', actual: 1800000, target: 2000000, diff: -200000, base: 1800000, surplus: 0, deficit: 0 },
    { period: '7월', actual: 2200000, target: 2000000, diff: 200000, base: 2000000, surplus: 200000, deficit: 0 },
    { period: '8월', actual: 1900000, target: 2000000, diff: -100000, base: 1900000, surplus: 0, deficit: 0 },
    { period: '9월', actual: 2000000, target: 2000000, diff: 0, base: 2000000, surplus: 0, deficit: 0 },
    { period: '10월', actual: 2100000, target: 2000000, diff: 100000, base: 2000000, surplus: 100000, deficit: 0 },
    { period: '11월', actual: 1800000, target: 2000000, diff: -200000, base: 1800000, surplus: 0, deficit: 0 },
    { period: '12월', actual: 2500000, target: 2000000, diff: 500000, base: 2000000, surplus: 500000, deficit: 0 },
    ];

  const [data, setData] = useState({
    daily: dailyData,
    weekly: weeklyData,
    monthly: monthlyData,
  });

  // 종합 목표 설정 상태
  const [goals, setGoals] = useState({
    daily: 0,  //일간 목표
    weekly: 0,     // 주간 목표
    monthly: 0,   // 월간 목표
    yearly: 0,   // 연간 목표
    currentYearly: 0,  //올해 누적 금액
    finalGoal: 0, // 최종 목표
    currentTotal: 0, // 현재까지 모은 총액 예시
  });

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(()=>{
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [inputAmount, setInputAmount] = useState('');

  // 기간 조회 변수 | 이전: -1, 다음: 1
  const [dateOffset, setDateOffset] = useState(0);

  //기간 조회 함수
  const getCurrentFilteredData = () => {
  if (viewMode === 'daily') {
    const chunkSize = 7;
    const totalLength = data.daily.length;
    const endIndex = totalLength + (dateOffset * chunkSize);
    const startIndex = Math.max(0, endIndex - chunkSize);
    
    if (endIndex <= 0) return [];
    return data.daily.slice(startIndex, endIndex);

  } else if (viewMode === 'weekly') {
    const chunkSize = 4;
    const totalLength = data.weekly.length;
    const endIndex = totalLength + (dateOffset * chunkSize);
    const startIndex = Math.max(0, endIndex - chunkSize);
    
    if (endIndex <= 0) return [];
    return data.weekly.slice(startIndex, endIndex);

  } else if (viewMode === 'monthly') {
    const chunkSize = 12;
    const totalLength = data.monthly.length;
    const endIndex = totalLength + (dateOffset * chunkSize);
    const startIndex = Math.max(0, endIndex - chunkSize);
    
    if (endIndex <= 0) return [];
    return data.monthly.slice(startIndex, endIndex);
  }

  return [];
};

  //일,주,월간 저축액 데이터 수정 함수
  const handleDataChange = (idx, value) => {
    //콤마 제거하고 숫자로 변환
    const cleanValue = value.replace(/,/g, '');

    const actual = Number(cleanValue) || 0;

    if(actual === 0) {
      setData(prevData => ({
        ...prevData,
        [viewMode]: prevData[viewMode].filter((_, i) => i !== idx)
      }));
      return;
    }
    const target = viewMode === 'daily' ? goals.daily : viewMode === 'weekly' ? goals.weekly : goals.monthly;
    
    const diff = actual - target;
    const base = Math.min(actual, target);
    const surplus = Math.max(0, diff);
    const deficit = Math.max(0, target - actual);

    const updatedList = [...data[viewMode]];

    updatedList[idx] = {
      ...updatedList[idx],
      actual,
      diff,
      base,
      surplus,
      deficit,
    };

    setData(prevData => ({
      ...prevData,
      [viewMode]: updatedList
    }));
  };

  //종합 목표 데이터 수정 함수
  const handleGoalChange = (field, value) => {
    const rawValue = value.replace(/,/g, '');
    const numericValue = rawValue === '' ? 0 : Number(rawValue);

    if(field === 'daily' || field === 'weekly' || field === 'monthly' || field === 'yearly'){
      let daily = 0;
      let weekly = 0;
      let monthly = 0;
      let yearly = 0;

      switch (field) {
        case 'daily':
          daily = numericValue;
          weekly = daily * 7;
          monthly = daily * 30;
          yearly = daily * 365;
          break;
        
        case 'weekly':
          weekly = numericValue;
          daily = Math.round(weekly / 7);
          monthly = Math.round(weekly * 4.33);
          yearly = weekly * 52;
          break;

        case 'monthly':
          monthly = numericValue;
          daily = Math.round(monthly / 30);
          weekly = Math.round(monthly / 4.33);
          yearly = monthly * 12;
          break;

        case 'yearly':
          yearly = numericValue;
          daily = Math.round(yearly / 365);
          weekly = Math.round(yearly / 52);
          monthly = Math.round(yearly / 12);
          break;

        default:
          break;
      }

      setGoals(prev => ({
        ...prev, 
        daily,
        weekly,
        monthly,
        yearly,
      }));
    } else {
      setGoals(prev => ({
        ...prev, 
        [field]: numericValue
      }));
    }
    
  };

//이전 기간 데이터 확인
const hasPreviousData = () => {
  const nextOffset = dateOffset - 1;
  const chunkSize = viewMode === 'daily' ? 7 : viewMode === 'weekly' ? 4 : 12;
  const totalLength = data[viewMode].length;
  const endIndex = totalLength + (nextOffset * chunkSize);
  return endIndex > 0;
};

const currentData = viewMode !== 'goals' ? getCurrentFilteredData() : [];

  // 데이터 추가 핸들러
  const handleAddSavings = (e) => {
    e.preventDefault();
    if (!inputAmount) return;

    const actual = Number(inputAmount);
    // 현재 뷰에 맞는 목표액 가져오기
    const target = viewMode === 'daily' ? goals.daily : viewMode === 'weekly' ? goals.weekly : goals.monthly;
    
    const diff = actual - target;
    const base = Math.min(actual, target);       // 목표까지만 채워지는 기본 금액
    const surplus = Math.max(0, diff);           // 목표를 넘긴 초과 금액

    const newItem = viewMode === 'daily' 
      ? { date: `8/${currentData.length + 1}`, actual, target, diff, base, surplus }
      : { period: `${currentData.length + 1}번째`, actual, target, diff, base, surplus };

    setData({
      ...data,
      [viewMode]: [...data[viewMode], newItem]
    });

    // 현재 총액에도 반영
    setGoals(prev => ({ 
      ...prev, 
      currentTotal: prev.currentTotal + actual,
      currentYearly: prev.currentYearly + (viewMode === 'monthly' ? actual: 0) 
    }));

    setInputAmount('');
    setShowModal(false);
  };

  // 가장 최근 데이터 기준 초과 여부 확인 (축하 카드용)
  const latestItem = currentData.length > 0 ? currentData[currentData.length - 1] : null;
  const isSurplus = latestItem && latestItem.actual > latestItem.target;
  const currentTarget = viewMode === 'daily' ? goals.daily : viewMode === 'weekly' ? goals.weekly : goals.monthly;

  // 최종 목표까지 소요 기간 계산 (월간 저축액 기준)
  const remainingAmount = Math.max(0, goals.finalGoal - goals.currentTotal);
  const monthsNeeded = goals.monthly > 0 ? Math.ceil(remainingAmount / goals.monthly) : 0;
  const yearsNeeded = (monthsNeeded / 12).toFixed(1);

  // 좌우 너비 
  const chartWidth = Math.max(340, currentData.length * 42);

  // viewMode 변경 시 0으로 초기화
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setDateOffset(0);
  };

  return (
    <div className="toss-container">
      {/* 상단 헤더 */}
      <header className="header">
        <div className="title-area">
          <span className="subtitle">money_box</span>
        </div>
        {viewMode !== 'goals' && (
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus size={20} /> 기록하기
          </button>
        )}
      </header>
      
      {viewMode === 'goals' ? null : (
      <div className="period-nav-bar">
        <button 
          className="period-nav-btn" 
          onClick={() => setDateOffset(prev => prev - 1)}
          disabled={!hasPreviousData()}
        >
          <ChevronLeft size={16} /> 
        </button>
        
        <span className="period-nav-title">
          {dateOffset === 0 ? '' : `${Math.abs(dateOffset)}${viewMode === 'daily' ? '주' : viewMode === 'weekly' ? '달' : '년'} 전`}
        </span>

        <button 
          className="period-nav-btn"
          onClick={() => setDateOffset(prev => prev + 1)} 
          disabled={dateOffset >= 0}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      )}

      {/* 뷰 전환 탭 */}
      <div className="tab-slider">
        <button className={viewMode === 'daily' ? 'active' : ''} onClick={() => setViewMode('daily')}>일간</button>
        <button className={viewMode === 'weekly' ? 'active' : ''} onClick={() => setViewMode('weekly')}>주간</button>
        <button className={viewMode === 'monthly' ? 'active' : ''} onClick={() => setViewMode('monthly')}>월간</button>
        <button className={viewMode === 'goals' ? 'active goal-tab' : 'goal-tab'} onClick={() => setViewMode('goals')}>종합목표</button>
      </div>

      {viewMode === 'goals' ? (
        /* 종합 목표 및 소요 기간 대시보드 */
        <div className="goals-dashboard">
          {/* 연간 목표 */}
          <section className="card goal-hierarchy-card">
            <div className="card-header">
              <Target size={18} className="icon-toss" />
              <span>연간 목표</span>
            </div>
            <div className="goal-progress-box">
              <div className="goal-row">
                <span className="label">연간 목표액</span>
                <input 
                  type="text"
                  inputMode='numeric'
                  value={goals.yearly ? goals.yearly.toLocaleString() : ''} 
                  onChange={(e) => handleGoalChange('yearly', e.target.value)}
                  className="goal-input-field"
                />
              </div>
              <div className="goal-row" style={{ marginTop: '8px' }}>
                <span className="label">올해 모은 금액</span>
                <span className="value">{goals.currentYearly.toLocaleString()}</span>
              </div>
              <div className="progress-bar-bg secondary" style={{ marginTop: '8px' }}>
                <div className="progress-bar-fill secondary" style={{ width: `${Math.min(100, (goals.currentYearly / goals.yearly) * 100)}%` }}></div>
              </div>
              <div className="goal-sub-info">
                <span>달성률 {goals.yearly > 0 ? ((goals.currentYearly / goals.yearly) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </section>

          {/* 최종 목표 달성 현황 */}
          <section className="card goal-summary-card">
            <div className="card-header">
              <Flag size={18} className="icon-toss" />
              <span>최종 목표 현황</span>
            </div>
            <div className="goal-progress-box">
              <div className="goal-row">
                <span className="label">최종 목표액</span>
                <input 
                  type="text"
                  inputMode='numeric'
                  value={goals.finalGoal ? goals.finalGoal.toLocaleString() : ''} 
                  onChange={(e) => handleGoalChange('finalGoal', e.target.value)}
                  className="goal-input-field"
                />
              </div>
              <div className="goal-row">
                <span className="label">현재 모은 총액</span>
                <input 
                  type="text" 
                  inputMode='numeric'
                  value={goals.currentTotal ? goals.currentTotal.toLocaleString() : ''} 
                  onChange={(e) => handleGoalChange('currentTotal', e.target.value)}
                  className="goal-input-field value highlight"/>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, (goals.currentTotal / goals.finalGoal) * 100)}%` }}
                ></div>
              </div>
              <p className="progress-pct">
                달성률: {goals.finalGoal > 0 ? ((goals.currentTotal / goals.finalGoal) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </section>

          {/* (일간/주간/월간 목표) 설정 및 소요 기간 */}
          <section className="card duration-card">
            <div className="card-header">
              <Zap size={18} className="icon-toss" />
              <span>주기별 저축 페이스</span>
            </div>
            <div className="duration-content">
              <div className="duration-item input-row">
                <span className="d-title">월간 목표 페이스</span>
                <input 
                  type="text"
                  inputMode='numeric'
                  value={goals.monthly ? goals.monthly.toLocaleString() : ''} 
                  onChange={(e) => handleGoalChange('monthly', e.target.value)}
                  className="goal-input-field"
                />
              </div>
              <div className="duration-item input-row">
                <span className="d-title">주간 목표</span>
                <input 
                  type="text" 
                  inputMode='numeric'
                  value={goals.weekly ? goals.weekly.toLocaleString() : ''} 
                  onChange={(e) => handleGoalChange('weekly', e.target.value)}
                  className="goal-input-field"
                />
              </div>
              <div className="duration-item input-row">
                <span className="d-title">일간 목표</span>
                <input 
                  type="text" 
                  inputMode='numeric'
                  value={goals.daily ? goals.daily.toLocaleString() : ''} 
                  onChange={(e) => handleGoalChange('daily', e.target.value)}
                  className="goal-input-field"
                />
              </div>
              <div className="duration-highlight-box" style={{ marginTop: '16px' }}>
                <span className="highlight-title">최종 목표까지</span>
                <span className="highlight-val">약 {monthsNeeded}개월 ({yearsNeeded}년)</span>
              </div>
            </div>
          </section>

        </div>
      ) : (
        <>
          {/* 초과 달성 축하 배너 */}
          {isSurplus && (
            <div className="surplus-celebration-card card">
              <div className="congrats-text">
                <Award size={24} className="icon-star" />
                <div>
                  <h3>목표 초과 달성!</h3>
                  <p>{viewMode === 'daily' ? '이번' : viewMode === 'weekly' ? '이번 주' : '이번 달'}엔 목표보다 <span className="highlight">{latestItem.surplus.toLocaleString()}원</span> 더 모았어요!</p>
                </div>
              </div>
            </div>
          )}

          {/* 통합 그래프 섹션 */}
          <section className="card graph-card">
            <div className="card-header">
              <TrendingUp size={18} className="icon-toss" />
              <span>{viewMode === 'daily' ? '일별' : viewMode === 'weekly' ? '주별' : '월별'} 저축 비교 그래프</span>
            </div>
              <div className="chart-scroll-container">
                <div className="chart-wrapper" style={{ width: `${chartWidth}px` }}>
                  <ResponsiveContainer>
                    <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis 
                        dataKey={viewMode === 'daily' ? 'date' : 'period'} 
                        stroke="#8b95a1" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        interval={0}
                      />
                      <YAxis 
                        stroke="#8b95a1" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => {
                          if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
                          if (value >= 10000) return `${(value / 10000).toLocaleString()}만`;
                          if (value >= 1000) return `${(value / 1000).toLocaleString()}천`;
                          if (value >= 100) return `${(value / 100).toLocaleString()}백`;
                          return value.toLocaleString();
                        }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          let label = '';
                          if (name === 'base') label = '목표 달성액';
                          else if(name === 'surplus') label = '초과저축액';
                          else if(name === 'deficit') label = '부족 저축액';

                          return [`${value.toLocaleString()}원`, label];
                        }}
                        contentStyle={{ background: '#191f28', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                      />
                      {/* 목표선 표시 */}
                      <ReferenceLine 
                        y={viewMode === 'daily' ? goals.daily : viewMode === 'weekly' ? goals.weekly : goals.monthly}
                        stroke="#3182ce" 
                        strokeDasharray="3 3" 
                        label={{ position: 'top', value: ``, fill: '#3182ce', fontSize: 11 }} 
                      />
                      
                      {/* 기본 목표 달성 막대 (파란색) */}
                      <Bar dataKey="base" stackId="stack" fill="#3182ce" radius={[0, 0, 0, 0]} name="base" />
                      
                      {/* 목표 초과분 막대 (민트색) */}
                      <Bar dataKey="surplus" stackId="stack" fill="#00c7be" radius={[6, 6, 0, 0]} name="surplus" />
                      
                      {/* 목표 미달설 막대 (연한 회색) */}
                      <Bar dataKey="deficit" stackId="stack" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="deficit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
          </section>

          {/* 달력 및 상세 차이 표기 섹션 */}
          <section className="card calendar-card">
            <div className="card-header">
              <CalendarIcon size={18} className="icon-toss" />
              <span>목표 대비 달성 현황</span>
            </div>
            <div className="diff-list">
              {currentData.map((item, idx) => {
                const isSurplus = item.actual > item.target;
                return (
                  <div key={idx} className="diff-item">
                    <span className="item-label">{item.date || item.period}</span>
                    <div className="item-values">
                      <span className='actual-val'>
                      <input 
                        type="text"
                        inputMode="numeric"
                        className="goal-input-field"
                        value={item.actual ? item.actual.toLocaleString() : ''}
                        onChange={(e)=>handleDataChange(idx, e.target.value)}
                      />원</span>
                      {isSurplus ? (
                        <span className="diff-badge surplus">+{item.surplus.toLocaleString()}원 초과!</span>
                      ) : (
                        <span className={`diff-badge ${item.diff >= 0 ? 'plus' : 'minus'}`}>{item.diff.toLocaleString()}원</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* 입력 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>저축액 기록하기 ({viewMode})</h3>
            <form onSubmit={handleAddSavings}>

              <div className="input-group">
                <label>
                  {viewMode === 'daily' && '기록할 날짜 선택'}
                  {viewMode === 'weekly' && '기록할 주 선택'}
                  {viewMode === 'monthly' && '기록할 월 선택'}
                </label>
                <input
                  type={viewMode === 'daily' ? 'date' : viewMode === 'weekly' ? 'week' : 'month'}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>실제 저축액</label>
                <input 
                  type="text" 
                  inputMode='numeric'
                  value={inputAmount ? Number(inputAmount).toLocaleString() : ''} 
                  onChange={(e) =>{
                    const rawValue = e.target.value.replace(/,/g, '');

                    if(rawValue === '' || !isNaN(Number(rawValue))){
                      setInputAmount(rawValue);
                    }
                  }}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className="submit-btn">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}