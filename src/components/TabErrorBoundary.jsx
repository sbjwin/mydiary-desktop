import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TabErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // 탭이 변경되면 에러 상태를 자동으로 초기화하여 복구 기회 제공
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="tab-error-fallback" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          minHeight: '400px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: '#dc2626',
          }}>
            <AlertTriangle size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
            화면을 불러오는 중 일시적인 오류가 발생했습니다
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', marginBottom: '24px', wordBreak: 'break-all' }}>
            {this.state.error?.message || '알 수 없는 렌더링 오류가 발생했습니다.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={this.handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={15} /> 다시 시도
            </button>
            {this.props.onNavigateHome && (
              <button
                type="button"
                className="btn-secondary"
                onClick={this.props.onNavigateHome}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Home size={15} /> 메인 시간표로 이동
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
