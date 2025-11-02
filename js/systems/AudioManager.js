/**
 * AudioManager.js
 *
 * Manages all audio playback including sound effects and background music.
 * Provides sound loading, playback control, volume management, and mute functionality.
 */

class AudioManager {
    constructor() {
        // Sound library - stores loaded audio elements
        this.sounds = new Map();

        // Sound pool for concurrent playback of same sound
        this.soundPools = new Map();
        this.poolSize = 3; // Max concurrent instances per sound

        // Volume settings
        this.masterVolume = 1.0;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.5;

        // Mute state
        this.isMuted = false;

        // Currently playing music
        this.currentMusic = null;

        // Loading state tracking
        this.loadingPromises = [];
        this.loadedCount = 0;
        this.totalSounds = 0;
    }

    /**
     * Load a sound file
     * @param {string} name - Identifier for the sound
     * @param {string} path - Path to the audio file
     * @param {boolean} isMusic - Whether this is background music (default: false)
     * @returns {Promise} Promise that resolves when sound is loaded
     */
    loadSound(name, path, isMusic = false) {
        const promise = new Promise((resolve, reject) => {
            const audio = new Audio();

            audio.addEventListener('canplaythrough', () => {
                this.loadedCount++;
                resolve();
            }, { once: true });

            audio.addEventListener('error', (e) => {
                console.error(`Failed to load sound: ${name} from ${path}`, e);
                reject(e);
            }, { once: true });

            audio.src = path;
            audio.preload = 'auto';

            // Set initial volume based on type
            audio.volume = this.isMuted ? 0 :
                          (isMusic ? this.musicVolume : this.sfxVolume) * this.masterVolume;

            // Store in appropriate collection
            if (isMusic) {
                this.sounds.set(name, { audio, isMusic: true });
            } else {
                // Create sound pool for SFX
                const pool = [];
                for (let i = 0; i < this.poolSize; i++) {
                    const clone = audio.cloneNode();
                    clone.volume = audio.volume;
                    pool.push(clone);
                }
                this.soundPools.set(name, pool);
                this.sounds.set(name, { audio, isMusic: false });
            }
        });

        this.loadingPromises.push(promise);
        this.totalSounds++;
        return promise;
    }

    /**
     * Load multiple sounds at once
     * @param {Object} soundMap - Object mapping sound names to paths
     * @param {boolean} isMusic - Whether these are music files
     * @returns {Promise} Promise that resolves when all sounds are loaded
     */
    loadSounds(soundMap, isMusic = false) {
        const promises = [];
        for (const [name, path] of Object.entries(soundMap)) {
            promises.push(this.loadSound(name, path, isMusic));
        }
        return Promise.all(promises);
    }

    /**
     * Wait for all sounds to finish loading
     * @returns {Promise} Promise that resolves when all sounds are loaded
     */
    waitForLoad() {
        return Promise.all(this.loadingPromises);
    }

    /**
     * Get loading progress
     * @returns {number} Progress from 0 to 1
     */
    getLoadProgress() {
        return this.totalSounds === 0 ? 1 : this.loadedCount / this.totalSounds;
    }

    /**
     * Play a sound effect
     * @param {string} name - Sound identifier
     * @param {boolean} loop - Whether to loop the sound (default: false)
     * @returns {HTMLAudioElement|null} The audio element playing, or null if not found
     */
    playSound(name, loop = false) {
        if (!this.sounds.has(name)) {
            console.warn(`Sound not found: ${name}`);
            return null;
        }

        const soundData = this.sounds.get(name);

        if (soundData.isMusic) {
            // Handle music playback
            return this._playMusic(name, loop);
        } else {
            // Handle SFX playback from pool
            return this._playSfx(name, loop);
        }
    }

    /**
     * Play sound effect from pool
     * @private
     */
    _playSfx(name, loop = false) {
        const pool = this.soundPools.get(name);
        if (!pool) return null;

        // Find available audio element in pool
        let audio = pool.find(a => a.paused || a.ended);

        // If all are busy, use the first one (interrupt)
        if (!audio) {
            audio = pool[0];
        }

        audio.loop = loop;
        audio.currentTime = 0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn(`Failed to play sound: ${name}`, e);
            });
        }

        return audio;
    }

    /**
     * Play background music
     * @private
     */
    _playMusic(name, loop = true) {
        // Stop current music if playing
        if (this.currentMusic) {
            this.stopSound(this.currentMusic);
        }

        const soundData = this.sounds.get(name);
        const audio = soundData.audio;

        audio.loop = loop;
        audio.currentTime = 0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn(`Failed to play music: ${name}`, e);
            });
        }

        this.currentMusic = name;
        return audio;
    }

    /**
     * Stop a specific sound or music
     * @param {string} name - Sound identifier
     */
    stopSound(name) {
        if (!this.sounds.has(name)) return;

        const soundData = this.sounds.get(name);

        if (soundData.isMusic) {
            // Stop music
            soundData.audio.pause();
            soundData.audio.currentTime = 0;
            if (this.currentMusic === name) {
                this.currentMusic = null;
            }
        } else {
            // Stop all instances in pool
            const pool = this.soundPools.get(name);
            if (pool) {
                pool.forEach(audio => {
                    audio.pause();
                    audio.currentTime = 0;
                });
            }
        }
    }

    /**
     * Stop all currently playing sounds
     */
    stopAllSounds() {
        // Stop all SFX
        for (const pool of this.soundPools.values()) {
            pool.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        }

        // Stop music
        for (const [name, soundData] of this.sounds.entries()) {
            if (soundData.isMusic) {
                soundData.audio.pause();
                soundData.audio.currentTime = 0;
            }
        }

        this.currentMusic = null;
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this._updateAllVolumes();
    }

    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this._updateAllVolumes();
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this._updateAllVolumes();
    }

    /**
     * Update all audio element volumes based on current settings
     * @private
     */
    _updateAllVolumes() {
        if (this.isMuted) return;

        // Update SFX volumes
        for (const pool of this.soundPools.values()) {
            const volume = this.sfxVolume * this.masterVolume;
            pool.forEach(audio => {
                audio.volume = volume;
            });
        }

        // Update music volumes
        for (const soundData of this.sounds.values()) {
            if (soundData.isMusic) {
                soundData.audio.volume = this.musicVolume * this.masterVolume;
            }
        }
    }

    /**
     * Mute all audio
     */
    mute() {
        this.isMuted = true;

        // Mute all SFX
        for (const pool of this.soundPools.values()) {
            pool.forEach(audio => {
                audio.volume = 0;
            });
        }

        // Mute music
        for (const soundData of this.sounds.values()) {
            if (soundData.isMusic) {
                soundData.audio.volume = 0;
            }
        }
    }

    /**
     * Unmute all audio
     */
    unmute() {
        this.isMuted = false;
        this._updateAllVolumes();
    }

    /**
     * Toggle mute state
     */
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    /**
     * Check if a sound is loaded
     * @param {string} name - Sound identifier
     * @returns {boolean}
     */
    hasSound(name) {
        return this.sounds.has(name);
    }

    /**
     * Check if currently muted
     * @returns {boolean}
     */
    getMuted() {
        return this.isMuted;
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopAllSounds();
        this.sounds.clear();
        this.soundPools.clear();
        this.currentMusic = null;
    }
}
