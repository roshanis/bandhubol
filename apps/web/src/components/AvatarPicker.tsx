export type AvatarOption = {
  id: string;
  name: string;
  shortDescription: string;
  toneLabel: string;
};

export interface AvatarPickerProps {
  avatars: AvatarOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const avatarEmojis: Record<string, string> = {
  riya: '🌸',
  arjun: '🌿',
  meera: '✨',
  kabir: '🔮'
};

export function AvatarPicker({
  avatars,
  selectedId,
  onSelect
}: AvatarPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose your companion"
      className="avatar-picker"
    >
      {avatars.map((avatar) => {
        const isSelected = avatar.id === selectedId;
        return (
          <button
            key={avatar.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-avatar={avatar.id}
            className={`avatar-card${isSelected ? " avatar-card-selected" : ""}`}
            onClick={() => onSelect(avatar.id)}
          >
            <div className="avatar-icon">
              {avatarEmojis[avatar.id] || '💬'}
            </div>
            <div className="avatar-card-header">
              <span className="avatar-name">{avatar.name}</span>
            </div>
            <span className="avatar-tone">{avatar.toneLabel}</span>
            <p className="avatar-description">{avatar.shortDescription}</p>
          </button>
        );
      })}
    </div>
  );
}
