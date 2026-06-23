import { useMemo } from 'react';
import './Avatar.css';

const scope = 'wx-aaec9iwE';

function getLabel(user) {
  return user.label ?? user.name ?? '';
}

function getInitials(user) {
  const label = getLabel(user).trim();
  if (!label) return '';
  const words = label.split(/\s+/);
  return (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase().slice(0, 2);
}

function getImage(user) {
  return user.img ?? user.avatar;
}

function Avatar(props) {
  const { value, size = 24, limit } = props;

  const users = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value],
  );
  const safeLimit = useMemo(
    () =>
      typeof limit === 'number' && Number.isFinite(limit)
        ? Math.max(0, Math.floor(limit))
        : users.length,
    [limit, users],
  );
  const visibleUsers = useMemo(
    () => users.slice(0, safeLimit),
    [users, safeLimit],
  );
  const overflowCount = useMemo(
    () => Math.max(0, users.length - visibleUsers.length),
    [users, visibleUsers],
  );
  const fontSize = useMemo(() => Math.max(10, Math.round(size * 0.42)), [size]);
  const stackStyle = useMemo(
    () => ({
      '--wx-avatar-size': `${size}px`,
      '--wx-avatar-font-size': `${fontSize}px`,
    }),
    [size, fontSize],
  );

  if (users.length === 0) return null;

  return (
    <div className={`wx-avatars ${scope}`} style={stackStyle}>
      {visibleUsers.map((user) => {
        const label = getLabel(user);
        const image = getImage(user);
        return (
          <span
            key={user.id}
            className={`wx-avatar ${user.css ?? ''} ${scope}`}
            title={label || undefined}
            aria-label={label || undefined}
          >
            {image ? (
              <img
                className={`wx-image ${scope}`}
                src={image}
                alt=""
                loading="lazy"
              />
            ) : (
              getInitials(user)
            )}
          </span>
        );
      })}
      {overflowCount > 0 && (
        <span className={`wx-avatar wx-more ${scope}`}>+{overflowCount}</span>
      )}
    </div>
  );
}

export default Avatar;
