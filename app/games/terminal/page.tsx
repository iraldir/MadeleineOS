"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const BLOCKED_GAMES_KEY = "madeleine_blocked_games";

interface CommandHistory {
  command: string;
  output: string;
  timestamp: Date;
}

const gameIndexMap: { [key: string]: string } = {
  "0": "character-recognition",
  "1": "typing",
  "2": "coloring-search",
  "3": "math",
  "4": "vocab",
  "5": "writing",
  "6": "terminal"
};

export default function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [blockedGames, setBlockedGames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load blocked games from localStorage
    const blocked = localStorage.getItem(BLOCKED_GAMES_KEY);
    if (blocked) {
      setBlockedGames(JSON.parse(blocked));
    }
    
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when history updates
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toUpperCase();
    const parts = trimmedCmd.split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    let output = "";

    switch (command) {
      case "SET_CURRENCY":
        const amount = parseInt(args[0]);
        if (isNaN(amount)) {
          output = "ERROR: Invalid amount. Usage: SET_CURRENCY [number]";
        } else {
          // Set the currency directly in localStorage
          localStorage.setItem("madeleine_coins", amount.toString());
          // Force currency service to reload
          window.location.reload();
          output = `Currency set to ${amount} coins`;
        }
        break;

      case "BLOCK":
        const gameIndex = args[0];
        const gameName = gameIndexMap[gameIndex];
        if (!gameName) {
          output = `ERROR: Invalid game index. Available: 0-6\n0: character-recognition\n1: typing\n2: coloring-search\n3: math\n4: vocab\n5: writing\n6: terminal`;
        } else {
          const newBlocked = [...blockedGames];
          if (!newBlocked.includes(gameName)) {
            newBlocked.push(gameName);
            setBlockedGames(newBlocked);
            localStorage.setItem(BLOCKED_GAMES_KEY, JSON.stringify(newBlocked));
            output = `Game "${gameName}" has been blocked`;
          } else {
            output = `Game "${gameName}" is already blocked`;
          }
        }
        break;

      case "UNBLOCK":
        const unblockIndex = args[0];
        const unblockGame = gameIndexMap[unblockIndex];
        if (!unblockGame) {
          output = `ERROR: Invalid game index. Available: 0-6`;
        } else {
          const newBlocked = blockedGames.filter(g => g !== unblockGame);
          setBlockedGames(newBlocked);
          localStorage.setItem(BLOCKED_GAMES_KEY, JSON.stringify(newBlocked));
          output = `Game "${unblockGame}" has been unblocked`;
        }
        break;

      case "RESET":
        if (args[0] === "CONFIRM") {
          localStorage.clear();
          output = "System reset complete. All data has been cleared. Reloading...";
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        } else {
          output = "WARNING: This will delete ALL data including progress, coins, and settings.\nTo confirm, type: RESET CONFIRM";
        }
        break;

      case "HELP":
        output = `Available commands:
SET_CURRENCY [number] - Set coin amount
BLOCK [0-6] - Block a game by index
UNBLOCK [0-6] - Unblock a game by index
RESET - Clear all data (requires confirmation)
STATUS - Show current system status
HELP - Show this message`;
        break;

      case "STATUS":
        const coins = localStorage.getItem("madeleine_coins") || "10";
        output = `System Status:
Coins: ${coins}
Blocked Games: ${blockedGames.length > 0 ? blockedGames.join(", ") : "None"}`;
        break;

      default:
        if (trimmedCmd === "") {
          return;
        }
        output = `Unknown command: ${command}\nType HELP for available commands`;
    }

    setHistory(prev => [...prev, {
      command: cmd,
      output: output,
      timestamp: new Date()
    }]);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={32} />
        </Link>
      </nav>

      <div className={styles.terminal}>
        <div className={styles.header}>
          <span className={styles.title}>Madeleine System Terminal</span>
          <span className={styles.subtitle}>Parent Access Only</span>
        </div>

        <div className={styles.content}>
          {history.map((item, index) => (
            <div key={index} className={styles.entry}>
              <div className={styles.command}>
                <span className={styles.prompt}>admin@madeleine:~$</span>
                <span className={styles.commandText}>{item.command}</span>
              </div>
              <div className={styles.output}>{item.output}</div>
            </div>
          ))}
          <div ref={historyEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputLine}>
          <span className={styles.prompt}>admin@madeleine:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.input}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </form>
      </div>
    </main>
  );
}