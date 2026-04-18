# Campaign Growth Progress Component

Component thanh tiến độ cao cấp với hệ thống cây phát triển theo giai đoạn gây quỹ.

## Features

- ✨ 4 giai đoạn cây phát triển theo % progress
- 🎨 Gradient colors và glow effects tinh tế
- 🌊 Animated energy orb di chuyển theo progress
- 🎯 Micro-animations mượt mà (sway, float, breathe, pulse)
- 📱 Fully responsive
- ♿ Accessibility support (reduced motion)
- 🎛️ Multiple sizes và variants
- 💎 Premium design

## Tree Stages

### 1. Seedling (0-32%) - Mầm hy vọng
- Cây mới nhú, 2 lá nhỏ
- Màu xanh non (#86EFAC)
- Animation: float, sway nhẹ
- Glow: emerald soft

### 2. Growing (33-65%) - Đang lớn mạnh
- Cây con có thân và cành
- Màu xanh tươi (#22C55E)
- Animation: breathe, sway
- Glow: green medium

### 3. Mature (66-99%) - Sắp đơm trái
- Cây trưởng thành, tán lá đầy
- Màu xanh đậm (#16A34A)
- Animation: breathe, enhanced glow
- Glow: emerald strong

### 4. Fruiting (100%+) - Đã kết trái
- Cây ra trái vàng
- Màu xanh đậm + vàng (#F59E0B)
- Animation: bounce fruits, twinkle sparkles
- Glow: amber celebration

## Usage

### Basic

```tsx
import CampaignGrowthProgress from '@/components/campaign/CampaignGrowthProgress';

<CampaignGrowthProgress
  currentAmount={350000000}
  goalAmount={500000000}
/>
```

### With Options

```tsx
<CampaignGrowthProgress
  currentAmount={350000000}
  goalAmount={500000000}
  size="lg"
  showTree={true}
  showAnimatedHead={true}
  variant="default"
  className="my-custom-class"
/>
```

### Compact Variant (No Tree)

```tsx
<CampaignGrowthProgress
  currentAmount={350000000}
  goalAmount={500000000}
  variant="compact"
  size="md"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentAmount` | `number` | required | Số tiền đã gây quỹ (VND) |
| `goalAmount` | `number` | required | Mục tiêu gây quỹ (VND) |
| `showTree` | `boolean` | `true` | Hiển thị cây phát triển |
| `showAnimatedHead` | `boolean` | `true` | Hiển thị energy orb animation |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Kích thước component |
| `variant` | `'default' \| 'compact'` | `'default'` | Kiểu hiển thị |
| `className` | `string` | `''` | Custom CSS classes |

## Sizes

### Small (`sm`)
- Bar height: 8px (h-2)
- Tree: 32x48px
- Orb: 12px
- Text: text-xs
- Best for: Cards, lists

### Medium (`md`)
- Bar height: 12px (h-3)
- Tree: 48x64px
- Orb: 16px
- Text: text-sm
- Best for: Campaign cards, dashboard

### Large (`lg`)
- Bar height: 16px (h-4)
- Tree: 64x80px
- Orb: 20px
- Text: text-base
- Best for: Campaign detail page, hero sections

## Animations

### CSS Keyframes
- `sway`: Cây lắc lư nhẹ (3s)
- `float`: Lá bay nhẹ (2.5s)
- `breathe`: Thở nhẹ (2s)
- `twinkle`: Lấp lánh (1.5s)
- `fadeOut`: Particle trail (1s)

### Tailwind Animations
- `animate-pulse`: Glow effect
- `animate-bounce`: Fruits
- `animate-[spin]`: Orb inner light

### Reduced Motion
Component tự động tắt animations khi user bật `prefers-reduced-motion`.

## Performance

- Sử dụng CSS animations thay vì JS
- `useMemo` cho calculations
- Transition duration: 1000ms (smooth)
- No layout shift
- GPU-accelerated transforms

## Accessibility

- Semantic HTML
- ARIA labels ready
- Keyboard navigation support
- Reduced motion support
- High contrast compatible
- Screen reader friendly

## Integration Examples

### Campaign Card

```tsx
<div className="bg-white rounded-3xl p-8">
  <h3 className="text-xl font-bold mb-4">Smart Watch Pro</h3>
  <CampaignGrowthProgress
    currentAmount={350000000}
    goalAmount={500000000}
    size="md"
  />
</div>
```

### Dashboard Stats

```tsx
<div className="grid grid-cols-3 gap-6">
  {campaigns.map(campaign => (
    <div key={campaign.id} className="bg-white rounded-2xl p-6">
      <h4 className="font-bold mb-3">{campaign.title}</h4>
      <CampaignGrowthProgress
        currentAmount={campaign.currentAmount}
        goalAmount={campaign.goalAmount}
        size="sm"
        variant="compact"
      />
    </div>
  ))}
</div>
```

### Campaign Detail Hero

```tsx
<section className="bg-gradient-to-br from-emerald-50 to-green-50 py-20">
  <div className="max-w-4xl mx-auto">
    <h1 className="text-5xl font-black mb-8">Smart Watch Pro</h1>
    <CampaignGrowthProgress
      currentAmount={campaign.currentAmount}
      goalAmount={campaign.goalAmount}
      size="lg"
    />
  </div>
</section>
```

## Customization

### Custom Colors

Modify `TREE_STAGES` in `CampaignGrowthProgress.tsx`:

```tsx
const TREE_STAGES = {
  seedling: {
    color: 'from-blue-400 to-cyan-500', // Your custom gradient
    glowColor: 'shadow-blue-400/50',
  },
  // ...
};
```

### Custom Tree SVGs

Edit `TreeStages.tsx` to modify tree designs:

```tsx
export const SeedlingTree: React.FC<TreeProps> = ({ className }) => (
  <svg viewBox="0 0 40 60" className={className}>
    {/* Your custom SVG paths */}
  </svg>
);
```

## Demo

Visit `/demo/progress` to see all variants and interactive controls.

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS 3+
- No external animation libraries needed

## File Structure

```
src/components/campaign/
├── CampaignGrowthProgress.tsx  # Main component
├── TreeStages.tsx              # SVG tree components
└── README.md                   # This file
```

## Tips

1. **Performance**: Use `variant="compact"` for lists with many items
2. **Mobile**: Size `sm` or `md` works best on mobile
3. **Dark mode**: Add dark mode variants if needed
4. **Custom styling**: Use `className` prop for additional styles
5. **Animation control**: Set `showAnimatedHead={false}` to reduce motion

## Future Enhancements

- [ ] Dark mode support
- [ ] More tree variants (flower, bamboo, etc.)
- [ ] Sound effects option
- [ ] Confetti on 100%
- [ ] Custom milestone markers
- [ ] Internationalization

## License

MIT
