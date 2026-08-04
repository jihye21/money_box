import React, { useState } from 'react';
import { Plus, TrendingUp, Calendar as CalendarIcon, Target, Flag, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
  , ReferenceLine
 } from 'recharts';
import './App.css';

export default function App() {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'goals'
  
  // 일간
  const dailyData = [
    { date: '월', actual: 15000, target: 15000, diff: 0, base: 15000, surplus: 0 },
    { date: '화', actual: 22000, target: 15000, diff: 7000, base: 15000, surplus: 7000 },
    { date: '수', actual: 10000, target: 15000, diff: -5000, base: 10000, surplus: 0 },
    { date: '목', actual: 18000, target: 15000, diff: 3000, base: 15000, surplus: 3000 },
    { date: '금', actual: 15000, target: 15000, diff: 0, base: 15000, surplus: 0 },
    { date: '토', actual: 12000, target: 15000, diff: -3000, base: 12000, surplus: 0 },
    { date: '일', actual: 20000, target: 15000, diff: 5000, base: 15000, surplus: 5000 },
  ];

  // 주간
  const weeklyData = [
    { period: '1주차', actual: 90000, target: 100000, diff: -10000, base: 90000, surplus: 0 },
    { period: '2주차', actual: 110000, target: 100000, diff: 10000, base: 100000, surplus: 10000 },
    { period: '3주차', actual: 70000, target: 100000, diff: -30000, base: 70000, surplus: 0 },
    { period: '4주차', actual: 130000, target: 100000, diff: 30000, base: 100000, surplus: 30000 },
    { period: '5주차', actual: 100000, target: 100000, diff: 0, base: 100000, surplus: 0 },
  ];

  // 월간
  const monthlyData = [
    { period: '1월', actual: 2000000, target: 2000000, diff: 0, base: 2000000, surplus: 0 },
    { period: '2월', actual: 2200000, target: 2000000, diff: 200000, base: 2000000, surplus: 200000 },
    { period: '3월', actual: 2000000, target: 2000000, diff: 0, base: 2000000, surplus: 0 },
    { period: '4월', actual: 1900000, target: 2000000, diff: -100000, base: 1900000, surplus: 0 },
    { period: '5월', actual: 2300000, target: 2000000, diff: 300000, base: 2000000, surplus: 300000 },
    { period: '6월', actual: 1800000, target: 2000000, diff: -200000, base: 1800000, surplus: 0 },
    { period: '7월', actual: 2200000, target: 2000000, diff: 200000, base: 2000000, surplus: 200000 },
    { period: '8월', actual: 1900000, target: 2000000, diff: -100000, base: 1900000, surplus: 0 },
    { period: '9월', actual: 2000000, target: 2000000, diff: 0, base: 2000000, surplus: 0 },
    { period: '10월', actual: 2100000, target: 2000000, diff: 100000, base: 2000000, surplus: 100000 },
    { period: '11월', actual: 1800000, target: 2000000, diff: -200000, base: 1800000, surplus: 0 },
    { period: '12월', actual: 2500000, target: 2000000, diff: 500000, base: 2000000, surplus: 500000 },
  ];

  const [data, setData] = useState({
    daily: dailyData,
    weekly: weeklyData,
    monthly: monthlyData,
  });

  // 종합 목표 설정 상태
  const [goals, setGoals] = useState({
    daily: 15000,  //일간 목표
    weekly: 15000,     // 주간 목표
    monthly: 2000000,   // 월간 목표
    yearly: 24000000,   // 연간 목표
    currentYearly: 8500000,  //올해 누적 금액
    finalGoal: 100000000, // 최종 목표
    currentTotal: 2950000, // 현재까지 모은 총액 예시
  });

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [inputAmount, setInputAmount] = useState('');

  const getCurrentFilteredData = () => {
    if (viewMode === 'daily') {
      return data.daily.slice(-7);
    } else if (viewMode === 'weekly') {
      return data.weekly.slice(0, 5);
    } else if (viewMode === 'monthly') {
      return data.monthly.slice(0, 12);
    }
    return [];
  };
  
  const currentData = viewMode !== 'goals' ? data[viewMode] : [];

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

  const chartWidth = Math.max(340, currentData.length * 42);

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

          <section className="card goal-hierarchy-card">
            <div className="card-header">
              <Target size={18} className="icon-toss" />
              <span>연간</span>
            </div>
            <div className="goal-progress-box">
              <div className="goal-row">
                <span className="label">올해 모은 금액</span>
                <span className="value">{goals.currentYearly.toLocaleString()}원</span>
              </div>
              <div className="progress-bar-bg secondary">
                <div className="progress-bar-fill secondary" style={{ width: `${Math.min(100, (goals.currentYearly / goals.yearly) * 100)}%` }}></div>
              </div>
              <div className="goal-sub-info">
                <span>달성률 {((goals.currentYearly / goals.yearly) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </section>

          <section className="card goal-summary-card">
            <div className="card-header">
              <Flag size={18} className="icon-toss" />
              <span>최종 목표 달성 현황</span>
            </div>
            <div className="goal-progress-box">
              <div className="goal-row">
                <span className="label">최종 목표액</span>
                <span className="value bold">{goals.finalGoal.toLocaleString()}원</span>
              </div>
              <div className="goal-row">
                <span className="label">현재 모은 금액</span>
                <span className="value highlight">{goals.currentTotal.toLocaleString()}원</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, (goals.currentTotal / goals.finalGoal) * 100)}%` }}
                ></div>
              </div>
              <p className="progress-pct">
                달성률: {((goals.currentTotal / goals.finalGoal) * 100).toFixed(1)}%
              </p>
            </div>
          </section>

          <section className="card duration-card">
            <div className="card-header">
              <Target size={18} className="icon-toss" />
              <span>소요 기간 예측</span>
            </div>
            <div className="duration-content">
              <div className="duration-item">
                <span className="d-title">월간 저축 페이스</span>
                <span className="d-val">{goals.monthly.toLocaleString()}원 / 월</span>
              </div>
              <div className="duration-item">
                <span className="d-title">연간 환산 목표</span>
                <span className="d-val">{goals.yearly.toLocaleString()}원 / 년</span>
              </div>
              <div className="duration-highlight-box">
                <span className="highlight-title">최종 1억원까지 남은 기간</span>
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
                  <p>이번 {viewMode === 'daily' ? '' : viewMode === 'weekly' ? '주' : '달'}엔 목표보다 <span className="highlight">{latestItem.surplus.toLocaleString()}원</span> 더 모았어요!</p>
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
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis 
                        dataKey={viewMode === 'daily' ? 'date' : 'period'} 
                        troke="#8b95a1" 
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
                        formatter={(value, name) => [`${value.toLocaleString()}원`, name === 'base' ? '목표 달성액' : '초과 저축액']}
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
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
          </section>

          {/* 달력 및 상세 차이 표기 섹션 */}
          <section className="card calendar-card">
            <div className="card-header">
              <CalendarIcon size={18} className="icon-toss" />
              <span>목표 대비 달성 현황 (차이)</span>
            </div>
            <div className="diff-list">
              {currentData.map((item, idx) => {
                const isSurplus = item.actual > item.target;
                return (
                  <div key={idx} className="diff-item">
                    <span className="item-label">{item.date || item.period}</span>
                    <div className="item-values">
                      <span className="actual-val">{item.actual.toLocaleString()}원</span>
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
                <label>실제 저축액 (원)</label>
                <input 
                  type="number" 
                  value={inputAmount} 
                  onChange={(e) => setInputAmount(e.target.value)} 
                  placeholder="예: 2000000"
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