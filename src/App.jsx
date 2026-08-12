import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, Calendar as CalendarIcon, Target, Flag, Zap, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
  , ReferenceLine
 } from 'recharts';
import './App.css';

export default function App() {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('viewMode') || 'daily';
  }); // 'daily' | 'weekly' | 'monthly' | 'goals'

  useEffect(()=>{
    if(viewMode !== 'goals'){
      localStorage.setItem('viewMode', viewMode);
    }
  }, [viewMode]);
  
  // 일간
  const dailyData = [];

  // 주간
  const weeklyData = [];

  // 월간
  const monthlyData = [];

  const [data, setData] = useState(() =>{
    const savedData = localStorage.getItem('my_data');
    return savedData ? JSON.parse(savedData) : {

      daily: dailyData,

      weekly: weeklyData,

      monthly: monthlyData,

    };
  });
//로그
  useEffect(() => {
      localStorage.setItem('my_data', JSON.stringify(data));
      console.log("로그 수정 업데이트됨: ", JSON.stringify(data));
  }, [data]);

  // 종합 목표 설정 상태
  const [goals, setGoals] = useState(() =>{
    const savedGoals = localStorage.getItem('my_goals');
    
    return savedGoals ? JSON.parse(savedGoals) : {
      daily: 0,  //일간 목표
      weekly: 0,     // 주간 목표
      monthly: 0,   // 월간 목표
      yearly: 0,   // 연간 목표
      currentYearly: 0,  //올해 누적 금액
      finalGoal: 0, // 최종 목표
      currentTotal: 0, // 현재까지 모은 총액 예시
    };
  });

  useEffect(() =>{
    localStorage.setItem('my_goals', JSON.stringify(goals));
  }, [goals]);

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
  const rawList = data[viewMode] || [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (viewMode === 'daily') {
    const baseDate = new Date(now);
    baseDate.setDate(now.getDate() + (dateOffset * 7));
    
    const day = baseDate.getDay();
    const diffToMonday = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    
    const weekStart = new Date(baseDate.setDate(diffToMonday));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return rawList
      .filter(item => {
        if (!item.rawDate) return false;
        const itemDate = new Date(item.rawDate);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= weekStart && itemDate <= weekEnd;
      })
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

  } else if (viewMode === 'weekly') {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + dateOffset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    return rawList
      .filter(item => {
        if (!item.rawDate) return false;
        const itemDate = new Date(item.rawDate);
        return itemDate.getFullYear() === targetYear && itemDate.getMonth() === targetMonth;
      })
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

  } else if (viewMode === 'monthly') {
    const targetYear = now.getFullYear() + dateOffset;

    return rawList
      .filter(item => {
        if (!item.rawDate) return false;
        const itemDate = new Date(item.rawDate);
        return itemDate.getFullYear() === targetYear;
      })
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  } else if (viewMode === 'yearly') {
    const currentYear = new Date().getFullYear();
    const baseYear = currentYear + (dateOffset * 10);
    const startYear = Math.floor(baseYear/10) * 10;
    const endYear = startYear + 9;

    return rawList 
      .filter(item => {
        if(!item.rawDate) return false;
        const itemYear = Number(String(item.rawDate).split('-')[0]);
        return itemYear >= startYear && itemYear <= endYear;
      })
      .sort((a, b) => {
        const yearA = Number(String(a.rawDate).split('-')[0]);
        const yearB = Number(String(b.rawDate).split('-')[0]);
        return yearA - yearB;
      });
  }

  return [];
};

  //일,주,월,연간 저축액 데이터 수정 함수
  const handleDataChange = (targetItem, value) => {
    //콤마 제거하고 숫자로 변환
    const cleanValue = value.replace(/,/g, '');

    const actual = Number(cleanValue) || 0;

    const currentList = data[viewMode] || [];

    //현재 리스트에서 수정/삭제하려는 actual 값 가져오기
    const existingItem = currentList.find(item => item.rawDate === targetItem.rawDate);
    const oldActual = existingItem ? existingItem.actual : 0;

    //diff 계산
    const diffAmount = actual - oldActual;

    //0이면 데이터 삭제
    if(actual === 0) {
      setData(prevData => ({
        ...prevData,
        [viewMode]: prevData[viewMode].filter(item => item.rawDate !== targetItem.rawDate)
      }));

      //"현재 모음 총액" - 삭제된 금액
      setGoals(prev => ({
        ...prev, 
        currentTotal: Math.max(0, prev.currentTotal - oldActual)
      }));
      return;
    }
    const target = (
        viewMode === 'daily' ? goals.daily 
      : viewMode === 'weekly' ? goals.weekly 
      : viewMode === 'monthly' ? goals.monthly : goals.yearly
    );
  
    const diff = actual < target ? target - actual : 0;
    const base = Math.min(actual, target);
    const surplus = Math.max(0, actual - target);
    const deficit = actual < target ? target - actual : 0;

    const updatedList = currentList.map(item => {
      if (item.rawDate === targetItem.rawDate) {
        return {
          ...item, 
          actual,
          target,
          diff, 
          base,
          surplus,
          deficit,
        };
      }
      return item;
    });
    
    setData(prevData => ({
      ...prevData,
      [viewMode]: updatedList
    }));

    setGoals(prev => ({
      ...prev,
      currentTotal: Math.max(0, prev.currentTotal + diffAmount)
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

//이전 기간 데이터 확인 함수
const hasPreviousData = () => {
  const rawList = data[viewMode] || [];
  if (rawList.length === 0) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nextOffset = dateOffset - 1;

  if (viewMode === 'daily') {
    const baseDate = new Date(now);
    baseDate.setDate(now.getDate() + (nextOffset * 7));
    const day = baseDate.getDay();
    const diffToMonday = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    
    const weekStart = new Date(baseDate.setDate(diffToMonday));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return rawList.some(item => {
      if (!item.rawDate) return false;
      const itemDate = new Date(item.rawDate);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });

  } else if (viewMode === 'weekly') {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + nextOffset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    return rawList.some(item => {
      if (!item.rawDate) return false;
      const itemDate = new Date(item.rawDate);
      return itemDate.getFullYear() === targetYear && itemDate.getMonth() === targetMonth;
    });

  } else if (viewMode === 'monthly') {
    const targetYear = now.getFullYear() + nextOffset;

    return rawList.some(item => {
      if (!item.rawDate) return false;
      const itemDate = new Date(item.rawDate);
      return itemDate.getFullYear() === targetYear;
    });
  } else if(viewMode === 'yearly') {
    const currentYear = new Date().getFullYear();
    const baseYear = currentYear + (dateOffset * 10);
    const currentStartYear = Math.floor(baseYear / 10) * 10;

    return rawList.some(item => {
      if(!item.rawDate) return false;
      const itemYear = Number(String(item.rawDate).split('-')[0]);
      return itemYear < currentStartYear;
    });
  }

  return false;
};

 const currentTarget = 
    viewMode === 'daily' ? goals.daily 
  : viewMode === 'weekly' ? goals.weekly
  : viewMode === 'monthly' ? goals.monthly 
  : goals.yearly;

const currentData = viewMode !== 'goals' 
  ? getCurrentFilteredData().map(item => ({
    ...item,
    target: currentTarget,
    diff: item.actual < currentTarget ? currentTarget - item.actual : 0,
    base: Math.min(item.actual, currentTarget),
    surplus: Math.max(0, item.actual - currentTarget),
    deficit: item.actual < currentTarget ? currentTarget - item.actual: 0,
  })) : [];

  // 데이터 추가 핸들러
  const handleAddSavings = (e) => {
  e.preventDefault();
  if (!inputAmount || !selectedDate) return;

  const actualToAdd = Number(inputAmount);
  // 현재 뷰에 맞는 목표액 가져오기
  const target = viewMode === 'daily' ? goals.daily : viewMode === 'weekly' 
    ? goals.weekly : viewMode === 'monthly' ? goals.monthly : goals.yearly;

  // 날짜 생성 로직
  let dateLabel = '';
  if (viewMode === 'daily' && selectedDate) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayName = days[dateObj.getDay()];

    dateLabel = `${month}/${day} (${dayName})`;
  } else if (viewMode === 'weekly' && selectedDate) {
    const [year, weekStr] = selectedDate.split('-W');
    const weekNum = Number(weekStr);

    const month = new Date(year, 0, (weekNum - 1) * 7 + 1).getMonth() + 1;
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const calculatedWeek = Math.ceil((new Date(year, month - 1, 1).getDate() + firstDayOfMonth) / 7);

    dateLabel = `${month}월 ${calculatedWeek || 1}주차`;
  } else if (viewMode === 'monthly' && selectedDate) {
    const [year, month] = selectedDate.split('-');
    dateLabel = `${Number(month)}월`;
  } else if (viewMode === 'yearly' && selectedDate) {
    const year = selectedDate.split('-')[0];
    dateLabel = `${year}년`;
  }

  const currentList = data[viewMode] || [];
  const existingIndex = currentList.findIndex(item => item.rawDate === selectedDate);

  let updatedList;

  if (existingIndex !== -1) {
    const existingItem = currentList[existingIndex];
    const newActual = existingItem.actual + actualToAdd;
    
    const diff = newActual < target ? target - newActual : 0;
    const base = Math.min(newActual, target);
    const surplus = Math.max(0, newActual - target);
    const deficit = newActual < target ? target - newActual : 0;

    updatedList = [...currentList];
    updatedList[existingIndex] = {
      ...existingItem,
      actual: newActual,
      diff,
      base,
      surplus,
      deficit
    };
  } else {
    const diff = actualToAdd < target ? target - actualToAdd : 0;
    const base = Math.min(actualToAdd, target);
    const surplus = Math.max(0, actualToAdd - target);
    const deficit = actualToAdd < target ? target - actualToAdd : 0;

    const newItem = {
      rawDate: selectedDate, 
      date: viewMode === 'daily' ? dateLabel : undefined,
      period: viewMode !== 'daily' ? dateLabel : undefined,
      actual: actualToAdd,
      target,
      diff,
      base,
      surplus,
      deficit
    };

    updatedList = [...currentList, newItem];
  }

  // 데이터 상태 업데이트
  setData({
    ...data,
    [viewMode]: updatedList
  });

  setGoals(prev => ({ 
    ...prev, 
    currentTotal: prev.currentTotal + actualToAdd,
    currentYearly: prev.currentYearly + (viewMode === 'monthly' ? actualToAdd : 0) 
  }));

  setInputAmount('');
  setSelectedDate('');
  setShowModal(false);
};

  // 가장 최근 데이터 기준 초과 여부 확인 (축하 카드용)
  const latestItem = currentData.length > 0 ? currentData[currentData.length - 1] : null;
  const isSurplus = latestItem && latestItem.actual > latestItem.target;
  

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
          {dateOffset === 0 ? '' 
            : `${Math.abs(dateOffset) * (viewMode === 'yearly' ? 10 : 1)}
            ${viewMode === 'daily' ? '주' : viewMode === 'weekly' ? '달' : '년'} 전`}
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
        <select 
          className={`toss-dropdown ${viewMode !== 'goals' ? 'active' : ''}`}
          value={viewMode === 'goals' ? (localStorage.getItem('viewMode') || 'daily') : viewMode}
          onChange={(e) => {
            setViewMode(e.target.value);
          }}
          onMouseDown={(e) => {
            if(viewMode === 'goals'){
              e.preventDefault();
              const savedMode = localStorage.getItem('viewMode') || 'daily';
              
              setViewMode(savedMode);
            }
          }}
        >
          <option value='daily'>일간</option>
          <option value='weekly'>주간</option>
          <option value='monthly'>월간</option>
          <option value='yearly'>연간</option>
        </select>
        
        <button className={viewMode === 'goals' ? 'active goal-tab' : 'goal-tab'} 
          onClick={() => 
          setViewMode('goals')}>종합목표</button>
      </div>

      {viewMode === 'goals' ? (
        /* 종합 목표 및 소요 기간 대시보드 */
        <div className="goals-dashboard">

          {/* 연간 목표 
          
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
          */}
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
                <span className="d-title">연간 목표</span>
                <input 
                  type="text"
                  inputMode='numeric'
                  value={goals.yearly ? goals.yearly.toLocaleString() : ''} 
                  onChange={(e) => handleGoalChange('yearly', e.target.value)}
                  className="goal-input-field"
                />
              </div>
              <div className="duration-item input-row">
                <span className="d-title">월간 목표</span>
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
                  <h3>초과 달성!</h3>
                  <p>{viewMode === 'daily' ? '이번' : viewMode === 'weekly' ? '이번 주' : viewMode === 'monthly' ? '이번 달' : '올해'}엔 목표보다 <span className="highlight">{latestItem.surplus.toLocaleString()}원</span> 더 모았어요!</p>
                </div>
              </div>
            </div>
          )}

          {/* 통합 그래프 섹션 */}
          <section className="card graph-card">
            <div className="card-header">
              <TrendingUp size={18} className="icon-toss" />
              <span>{viewMode === 'daily' ? '일별' : viewMode === 'weekly' ? '주별' : viewMode === 'monthly' ? '월별' : '연별'} 저축 비교 그래프</span>
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
                          if (name === 'base') label = '목표';
                          else if(name === 'surplus') label = '초과';
                          else if(name === 'diff') label = '부족';

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
                      <Bar dataKey="diff" stackId="stack" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="diff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
          </section>

          {/* 달력 및 상세 차이 표기 섹션 */}
          <section className="card calendar-card">
            <div className="card-header">
              <CalendarIcon size={18} className="icon-toss" />
              <span>달성 현황</span>

              <span className='header-total-amount'>
                {currentData.reduce((sum, item) => sum + (item.actual || 0), 0).toLocaleString()}원
              </span>
            </div>
            <div className="diff-list">
              {currentData.map((item) => {
                const isSurplus = item.actual > item.target;
                return (
                  <div key={item.rawDate} className="diff-item">
                    <span className="item-label">{item.date || item.period}</span>
                    <div className="item-values">
                      <span className='actual-val'>
                      <input 
                        type="text"
                        inputMode="numeric"
                        className="goal-input-field"
                        value={item.actual ? item.actual.toLocaleString() : ''}
                        onChange={(e)=>handleDataChange(item, e.target.value)}
                      />원</span>
                      {isSurplus ? (
                        <span className="diff-badge surplus">+{item.surplus.toLocaleString()}원 초과!</span>
                      ) : item.diff > 0 ? (
                        <span className={`diff-badge minus`}>-{item.diff.toLocaleString()}원</span>
                      ) : (
                        <span></span>
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
            <h3>저축 금액 기록하기 ({viewMode})</h3>
            <form onSubmit={handleAddSavings}>

              <div className="input-group">
                <label>
                  {viewMode === 'daily' && '기록할 날짜 선택'}
                  {viewMode === 'weekly' && '기록할 주 선택'}
                  {viewMode === 'monthly' && '기록할 월 선택'}
                  {viewMode === 'yearly' && '기록할 해 선택'}
                </label>
                <input
                  type={viewMode === 'daily' ? 'date' : viewMode === 'weekly' ? 'week' : viewMode === 'monthly' ? 'month': 'number'}
                  placeholder={viewMode === 'yearly' ? '연도 입력': undefined}
                  min={viewMode === 'yearly' ? '1900' : undefined}
                  max={viewMode === 'yearly' ? new Date().getFullYear() : undefined}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>저축 금액</label>
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
