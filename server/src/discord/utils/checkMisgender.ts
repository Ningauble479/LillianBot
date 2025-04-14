export function checkMisgender(content: string, correctPronouns: string): boolean {
    const lower = content.toLowerCase();
    console.log(correctPronouns);
    const wrongPronouns =
      correctPronouns === 'they/them'
        ? ['he', 'him', 'his', 'she', 'her']
        : correctPronouns === 'she/her'
        ? ['he', 'him', 'his']
        : correctPronouns === 'he/him'
        ? ['she', 'her']
        : [];
  
    return wrongPronouns.some(pronoun => lower.includes(pronoun));
  }