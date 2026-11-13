import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <div className="fade-in">
      <EmptyState
        icon="warning"
        title="404 · 页面不存在"
        hint="该地址可能已失效。返回指挥中心继续探索生存知识库。"
        action={
          <Link className="btn btn-primary" to="/">
            <Icon name="home" size={14} /> 返回首页
          </Link>
        }
      />
    </div>
  );
}
