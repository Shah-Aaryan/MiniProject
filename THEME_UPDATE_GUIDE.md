# Theme Update Guide - Blue-Black-Red Color Scheme

## Applied Changes

### Core Theme Colors
```css
Background: from-gray-900 via-black to-gray-900
Primary Blue: blue-400, blue-500, blue-600
Primary Red: red-400, red-500, red-600
Text Light: gray-300
Text Dark: white
Borders: red-900/50, blue-900/50
Card Backgrounds: black/60 with backdrop-blur-md
```

### Components Updated

#### 1. FeaturesDashboard
- ✅ Background: Black gradient
- ✅ Header: Blue-red gradient text
- ✅ Cards: Black with blue-red borders
- ✅ Buttons: Blue-red gradients
- ✅ Icons: Blue and red colors

#### 2. QuizCategories
- ✅ Background: Black gradient  
- ✅ Search bar: Dark background
- ✅ Category cards: Black with blue-red header bar
- ✅ Stats: Blue and red gradient boxes
- ✅ Start button: Blue-red gradient

#### 3. QuizTaking
- ✅ Background: Black gradient
- ✅ Timer: Blue (normal), Red (< 10s)
- ✅ Progress bar: Blue-red gradient
- ✅ Question card: Black with blue border
- ✅ Answer options: Dark gray, blue when selected
- ✅ Buttons: Blue-red gradients

#### 4. QuizResults (Partially Updated)
- ✅ Background: Black gradient
- ✅ Header: Blue-red gradient
- ✅ Stats cards: Blue-red theme
- ⚠️ Charts need color updates
- ⚠️ Performance insights need updates
- ⚠️ Answer review cards need updates

### Remaining Updates Needed

#### QuizResults - Charts Section
```javascript
// Update chart colors to blue-red
backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)'] // blue, red
borderColor: ['rgb(59, 130, 246)', 'rgb(239, 68, 68)']
```

#### QuizResults - Performance Insights
```jsx
className="bg-gradient-to-br from-blue-900/30 to-red-900/30 p-4 rounded-lg border border-blue-800/30"
```

#### QuizResults - Answer Review
```jsx
border-blue-400 bg-gradient-to-br from-blue-900/20 to-black // correct
border-red-400 bg-gradient-to-br from-red-900/20 to-black // incorrect
```

#### QuizResults - Action Buttons
```jsx
bg-gradient-to-r from-blue-600 to-red-600 // primary
border-blue-600 hover:border-red-600 // secondary
```

### Navigation Integration

#### Add to all feature pages:
```jsx
{/* Navigation Bar */}
<nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-900/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-lg flex items-center justify-center mr-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
          Career Guidance AI
        </span>
      </div>
      
      {/* Navigation Links */}
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/features')}>Features</button>
        <button onClick={() => navigate('/quiz/dashboard')}>Quiz</button>
        <button onClick={() => navigate('/portfolio')}>Portfolio</button>
        <button onClick={() => navigate('/skill-assessment')}>Assessment</button>
        <button onClick={() => navigate('/market/dashboard')}>Market</button>
        <button className="bg-gradient-to-r from-blue-600 to-red-600">Sign In</button>
      </div>
    </div>
  </div>
</nav>
```

### Quick Reference: Color Replacements

#### Replace These Colors:
- `purple-50` → `gray-900 or black`
- `purple-100` → `blue-900/30 or red-900/30`
- `purple-600` → `blue-600 or red-600`
- `purple-700` → `blue-700 or red-700`
- `cyan-` → `blue-`
- `yellow-` → `red-` (for accents)
- `orange-` → `red-`
- `green-` → Keep for success states
- `gray-600` → `gray-300` (for text)
- `gray-800` → `white` (for headings)

#### Background Patterns:
- Main: `bg-gradient-to-br from-gray-900 via-black to-gray-900`
- Cards: `bg-black/60 backdrop-blur-md`
- Buttons: `bg-gradient-to-r from-blue-600 to-red-600`
- Borders: `border border-red-900/50` or `border-blue-900/50`

### Testing Checklist

- [ ] All backgrounds are dark (no white/light backgrounds)
- [ ] All text is readable (white or light gray)
- [ ] Primary actions use blue-red gradient
- [ ] Icons use blue or red colors
- [ ] Hover states work properly
- [ ] Border colors match theme
- [ ] Charts use blue-red colors
- [ ] Loading states are visible
- [ ] Error messages are readable

### Files to Update

1. ✅ FeaturesDashboard.jsx - DONE
2. ✅ QuizCategories.jsx - DONE  
3. ✅ QuizTaking.jsx - DONE
4. ⚠️ QuizResults.jsx - PARTIAL (needs charts, insights, buttons)
5. ⚠️ SkillProfile.jsx - TODO
6. ⚠️ AdaptiveQuizDashboard.jsx - TODO
7. ⚠️ Portfolio.jsx - TODO
8. ⚠️ SkillAssessment.jsx - TODO
9. ⚠️ LaborMarket components - TODO
