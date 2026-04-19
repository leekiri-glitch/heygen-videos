# HeyGen Videos

Create AI-powered videos using HeyGen skills in Claude Code.

## Prerequisites

- Node.js 22+ (for skill support)
- HeyGen account with API key ([Get one here](https://app.heygen.com/api))
- Claude Code or Cursor IDE with skills support

## Setup

### 1. Configure HeyGen API Key

Add your HeyGen API key to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export HEYGEN_API_KEY=your_api_key_here
```

Then reload your shell:

```bash
source ~/.bashrc
# or
source ~/.zshrc
```

### 2. Install HeyGen Skills

HeyGen skills are registered automatically when you install them via:

```bash
npx skills add https://github.com/heygen-com/skills --skill heygen
```

This installs:
- `/heygen-video` — Generate videos from scripts or prompts
- `/heygen-avatar` — Create and manage AI avatars

## Usage

### Generate a Video

In Claude Code, use the `/heygen-video` command:

```
/heygen-video I want to create a 30-second explainer video about cloud computing
```

### Create an Avatar

Use the `/heygen-avatar` command to create a digital twin:

```
/heygen-avatar Create an avatar named "Alex" from my image with a professional voice
```

## Features

- **Video Generation**: Create videos from text scripts or AI-generated content
- **Avatar Management**: Create and manage persistent digital avatars
- **Multiple Styles**: 20+ curated video styles to choose from
- **Voice Support**: Multiple voices and languages available
- **API Integration**: Direct API access for programmatic video generation

## Documentation

- [HeyGen Skills Repository](https://github.com/heygen-com/skills)
- [HeyGen Developer Docs](https://developers.heygen.com)
- [HeyGen API Reference](https://docs.heygen.com)

## Troubleshooting

**Command not found**: Ensure `HEYGEN_API_KEY` is set and your shell has reloaded:
```bash
echo $HEYGEN_API_KEY  # Should show your API key
```

**Skills not appearing**: Verify the installation:
```bash
npx skills list
```

**API errors**: Check your HeyGen account has sufficient credits at [app.heygen.com](https://app.heygen.com)

## License

This project uses HeyGen's public skills and API services.
