const fs = require('fs');
const matter = require('gray-matter');

const files = ['code-analyzer.md', 'file-analyzer.md', 'test-runner.md', 'parallel-worker.md'];

files.forEach(file => {
  console.log(`\n=== Testing ${file} ===`);
  try {
    const filePath = `.claude/agents/${file}`;
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log('File size:', content.length, 'characters');
    
    // Try to parse with gray-matter
    const { data: frontmatter, content: body } = matter(content);
    
    console.log('✅ Parsed successfully');
    console.log('Frontmatter keys:', Object.keys(frontmatter));
    console.log('Name:', frontmatter.name);
    console.log('Description length:', frontmatter.description?.length || 0);
    console.log('Description preview:', (frontmatter.description || '').slice(0, 100) + '...');
    
  } catch (error) {
    console.log('❌ Parse error:', error.message);
    console.log('Error details:', error.stack);
  }
});