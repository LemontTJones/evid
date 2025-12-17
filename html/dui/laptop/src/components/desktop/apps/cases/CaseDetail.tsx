import { useCallback, useEffect, useState } from "react";
import type { Case, CaseEvidence, CaseNote, CaseStatus } from "./CasesApp";
import { useTranslation } from "../../../TranslationContext";
import Spinner from "../../../atoms/Spinner";

interface CaseDetailProps {
    caseItem: Case;
    onBack: () => void;
}

export default function CaseDetail(props: CaseDetailProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [evidence, setEvidence] = useState<CaseEvidence[]>([]);
    const [notes, setNotes] = useState<CaseNote[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [editedTitle, setEditedTitle] = useState(props.caseItem.title);
    const [editedDescription, setEditedDescription] = useState(props.caseItem.description);
    const [editedStatus, setEditedStatus] = useState<CaseStatus>(props.caseItem.status);
    const [editedAssignedTo, setEditedAssignedTo] = useState(props.caseItem.assigned_to);
    const [newNote, setNewNote] = useState("");
    const [showAddEvidenceModal, setShowAddEvidenceModal] = useState(false);
    const [newEvidenceType, setNewEvidenceType] = useState<"fingerprint" | "dna" | "magazine" | "other">("fingerprint");
    const [newEvidenceId, setNewEvidenceId] = useState("");
    const [newEvidenceNotes, setNewEvidenceNotes] = useState("");

    // Load evidence and notes
    const loadCaseData = useCallback(() => {
        setLoading(true);

        Promise.all([
            fetch(`https://${location.host}/triggerServerCallback`, {
                method: "post",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify({
                    name: "evidences:getCaseEvidence",
                    arguments: { caseId: props.caseItem.id }
                })
            }).then(r => r.json()),

            fetch(`https://${location.host}/triggerServerCallback`, {
                method: "post",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify({
                    name: "evidences:getCaseNotes",
                    arguments: { caseId: props.caseItem.id }
                })
            }).then(r => r.json())
        ]).then(([evidenceData, notesData]) => {
            setEvidence(evidenceData);
            setNotes(notesData);
        }).finally(() => {
            setLoading(false);
        });
    }, [props.caseItem.id]);

    useEffect(() => {
        loadCaseData();
    }, [loadCaseData]);

    const handleSaveCase = useCallback(() => {
        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
                name: "evidences:updateCase",
                arguments: {
                    caseId: props.caseItem.id,
                    title: editedTitle,
                    description: editedDescription,
                    status: editedStatus,
                    assignedTo: editedAssignedTo
                }
            })
        }).then(() => {
            setEditMode(false);
        });
    }, [props.caseItem.id, editedTitle, editedDescription, editedStatus, editedAssignedTo]);

    const handleAddNote = useCallback(() => {
        if (!newNote.trim()) return;

        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
                name: "evidences:addCaseNote",
                arguments: {
                    caseId: props.caseItem.id,
                    note: newNote
                }
            })
        }).then(() => {
            setNewNote("");
            loadCaseData();
        });
    }, [props.caseItem.id, newNote, loadCaseData]);

    const handleAddEvidence = useCallback(() => {
        if (!newEvidenceId.trim()) return;

        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
                name: "evidences:addEvidenceToCase",
                arguments: {
                    caseId: props.caseItem.id,
                    evidenceType: newEvidenceType,
                    evidenceIdentifier: newEvidenceId,
                    notes: newEvidenceNotes
                }
            })
        }).then(() => {
            setShowAddEvidenceModal(false);
            setNewEvidenceId("");
            setNewEvidenceNotes("");
            loadCaseData();
        });
    }, [props.caseItem.id, newEvidenceType, newEvidenceId, newEvidenceNotes, loadCaseData]);

    const handleRemoveEvidence = useCallback((evidenceId: number) => {
        fetch(`https://${location.host}/triggerServerCallback`, {
            method: "post",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
                name: "evidences:removeEvidenceFromCase",
                arguments: { evidenceId }
            })
        }).then(() => {
            loadCaseData();
        });
    }, [loadCaseData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "#4CAF50";
            case "active": return "#2196F3";
            case "closed": return "#9E9E9E";
            case "archived": return "#607D8B";
            default: return "#9E9E9E";
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    return <div style={{ width: "100%", height: "100%", padding: "20px", display: "flex", flexDirection: "column", gap: "20px", overflow: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
                onClick={props.onBack}
                style={{
                    padding: "10px 20px",
                    background: "white",
                    border: "2px solid #000",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "14px"
                }}
            >
                ← {t("laptop.desktop_screen.cases_app.back")}
            </button>

            {!editMode ? (
                <button
                    onClick={() => setEditMode(true)}
                    style={{
                        padding: "10px 20px",
                        background: "#008080",
                        color: "white",
                        border: "2px solid #000",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "14px"
                    }}
                >
                    {t("laptop.desktop_screen.cases_app.edit")}
                </button>
            ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setEditMode(false)}
                        style={{
                            padding: "10px 20px",
                            background: "white",
                            border: "2px solid #000",
                            cursor: "pointer",
                            fontFamily: "monospace",
                            fontSize: "14px"
                        }}
                    >
                        {t("laptop.desktop_screen.cases_app.cancel")}
                    </button>
                    <button
                        onClick={handleSaveCase}
                        style={{
                            padding: "10px 20px",
                            background: "#4CAF50",
                            color: "white",
                            border: "2px solid #000",
                            cursor: "pointer",
                            fontFamily: "monospace",
                            fontSize: "14px"
                        }}
                    >
                        {t("laptop.desktop_screen.cases_app.save")}
                    </button>
                </div>
            )}
        </div>

        {/* Case Info */}
        <div style={{ background: "white", border: "2px solid #000", padding: "20px" }}>
            <div style={{ marginBottom: "15px" }}>
                <strong style={{ fontFamily: "monospace", fontSize: "18px" }}>
                    {props.caseItem.case_number}
                </strong>
                {!editMode ? (
                    <span
                        style={{
                            marginLeft: "10px",
                            padding: "4px 12px",
                            background: getStatusColor(props.caseItem.status),
                            color: "white",
                            fontFamily: "monospace",
                            fontSize: "14px"
                        }}
                    >
                        {props.caseItem.status.toUpperCase()}
                    </span>
                ) : (
                    <select
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value as CaseStatus)}
                        style={{
                            marginLeft: "10px",
                            padding: "4px 12px",
                            border: "2px solid #000",
                            fontFamily: "monospace",
                            fontSize: "14px"
                        }}
                    >
                        <option value="open">{t("laptop.desktop_screen.cases_app.status_open")}</option>
                        <option value="active">{t("laptop.desktop_screen.cases_app.status_active")}</option>
                        <option value="closed">{t("laptop.desktop_screen.cases_app.status_closed")}</option>
                        <option value="archived">{t("laptop.desktop_screen.cases_app.status_archived")}</option>
                    </select>
                )}
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "bold" }}>
                    {t("laptop.desktop_screen.cases_app.title")}:
                </label>
                {!editMode ? (
                    <div style={{ fontFamily: "monospace", fontSize: "14px", marginTop: "5px" }}>
                        {props.caseItem.title}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "2px solid #000",
                            fontFamily: "monospace",
                            fontSize: "14px",
                            marginTop: "5px"
                        }}
                    />
                )}
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "bold" }}>
                    {t("laptop.desktop_screen.cases_app.description")}:
                </label>
                {!editMode ? (
                    <div style={{ fontFamily: "monospace", fontSize: "14px", marginTop: "5px", whiteSpace: "pre-wrap" }}>
                        {props.caseItem.description || t("laptop.desktop_screen.cases_app.no_description")}
                    </div>
                ) : (
                    <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "2px solid #000",
                            fontFamily: "monospace",
                            fontSize: "14px",
                            marginTop: "5px",
                            resize: "vertical"
                        }}
                    />
                )}
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "bold" }}>
                    {t("laptop.desktop_screen.cases_app.assigned_to")}:
                </label>
                {!editMode ? (
                    <div style={{ fontFamily: "monospace", fontSize: "14px", marginTop: "5px" }}>
                        {props.caseItem.assigned_to || t("laptop.desktop_screen.cases_app.unassigned")}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={editedAssignedTo}
                        onChange={(e) => setEditedAssignedTo(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "2px solid #000",
                            fontFamily: "monospace",
                            fontSize: "14px",
                            marginTop: "5px"
                        }}
                    />
                )}
            </div>

            <div style={{ display: "flex", gap: "30px", marginTop: "15px", fontFamily: "monospace", fontSize: "12px", color: "#666" }}>
                <div>{t("laptop.desktop_screen.cases_app.created_by")}: {props.caseItem.created_by}</div>
                <div>{t("laptop.desktop_screen.cases_app.created_at")}: {formatDate(props.caseItem.created_at)}</div>
                <div>{t("laptop.desktop_screen.cases_app.updated_at")}: {formatDate(props.caseItem.updated_at)}</div>
            </div>
        </div>

        {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <Spinner />
            </div>
        ) : (
            <>
                {/* Evidence Section */}
                <div style={{ background: "white", border: "2px solid #000", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <h3 style={{ margin: 0, fontFamily: "monospace" }}>
                            {t("laptop.desktop_screen.cases_app.evidence")} ({evidence.length})
                        </h3>
                        <button
                            onClick={() => setShowAddEvidenceModal(true)}
                            style={{
                                padding: "8px 16px",
                                background: "#008080",
                                color: "white",
                                border: "2px solid #000",
                                cursor: "pointer",
                                fontFamily: "monospace",
                                fontSize: "12px"
                            }}
                        >
                            + {t("laptop.desktop_screen.cases_app.add_evidence")}
                        </button>
                    </div>

                    {evidence.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", fontFamily: "monospace", color: "#666" }}>
                            {t("laptop.desktop_screen.cases_app.no_evidence")}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {evidence.map((ev) => (
                                <div
                                    key={ev.id}
                                    style={{
                                        padding: "10px",
                                        border: "2px solid #000",
                                        background: "#f0f0f0",
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "bold" }}>
                                            {ev.evidence_type.toUpperCase()}: {ev.evidence_identifier}
                                        </div>
                                        {ev.notes && (
                                            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#666", marginTop: "5px" }}>
                                                {ev.notes}
                                            </div>
                                        )}
                                        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#999", marginTop: "5px" }}>
                                            Added by {ev.added_by} on {formatDate(ev.added_at)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveEvidence(ev.id)}
                                        style={{
                                            padding: "5px 10px",
                                            background: "#f44336",
                                            color: "white",
                                            border: "2px solid #000",
                                            cursor: "pointer",
                                            fontFamily: "monospace",
                                            fontSize: "12px",
                                            height: "fit-content"
                                        }}
                                    >
                                        {t("laptop.desktop_screen.cases_app.remove")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes Section */}
                <div style={{ background: "white", border: "2px solid #000", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 15px 0", fontFamily: "monospace" }}>
                        {t("laptop.desktop_screen.cases_app.notes")} ({notes.length})
                    </h3>

                    <div style={{ marginBottom: "15px" }}>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder={t("laptop.desktop_screen.cases_app.add_note_placeholder")}
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "2px solid #000",
                                fontFamily: "monospace",
                                fontSize: "14px",
                                resize: "vertical"
                            }}
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            style={{
                                marginTop: "10px",
                                padding: "8px 16px",
                                background: !newNote.trim() ? "#ccc" : "#008080",
                                color: "white",
                                border: "2px solid #000",
                                cursor: !newNote.trim() ? "not-allowed" : "pointer",
                                fontFamily: "monospace",
                                fontSize: "14px"
                            }}
                        >
                            {t("laptop.desktop_screen.cases_app.add_note")}
                        </button>
                    </div>

                    {notes.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", fontFamily: "monospace", color: "#666" }}>
                            {t("laptop.desktop_screen.cases_app.no_notes")}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    style={{
                                        padding: "10px",
                                        border: "2px solid #000",
                                        background: "#f0f0f0"
                                    }}
                                >
                                    <div style={{ fontFamily: "monospace", fontSize: "14px", whiteSpace: "pre-wrap" }}>
                                        {note.note}
                                    </div>
                                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#999", marginTop: "5px" }}>
                                        {note.created_by} - {formatDate(note.created_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        )}

        {/* Add Evidence Modal */}
        {showAddEvidenceModal && (
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
            }}>
                <div style={{
                    background: "#c0c0c0",
                    border: "3px solid #000",
                    padding: "20px",
                    minWidth: "500px",
                    boxShadow: "5px 5px 0px #000"
                }}>
                    <h3 style={{ margin: "0 0 20px 0", fontFamily: "monospace" }}>
                        {t("laptop.desktop_screen.cases_app.add_evidence")}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <div>
                            <label style={{ fontFamily: "monospace", fontSize: "14px", display: "block", marginBottom: "5px" }}>
                                {t("laptop.desktop_screen.cases_app.evidence_type")}
                            </label>
                            <select
                                value={newEvidenceType}
                                onChange={(e) => setNewEvidenceType(e.target.value as any)}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "2px solid #000",
                                    fontFamily: "monospace",
                                    fontSize: "14px"
                                }}
                            >
                                <option value="fingerprint">{t("laptop.desktop_screen.cases_app.evidence_fingerprint")}</option>
                                <option value="dna">{t("laptop.desktop_screen.cases_app.evidence_dna")}</option>
                                <option value="magazine">{t("laptop.desktop_screen.cases_app.evidence_magazine")}</option>
                                <option value="other">{t("laptop.desktop_screen.cases_app.evidence_other")}</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontFamily: "monospace", fontSize: "14px", display: "block", marginBottom: "5px" }}>
                                {t("laptop.desktop_screen.cases_app.evidence_identifier")} *
                            </label>
                            <input
                                type="text"
                                value={newEvidenceId}
                                onChange={(e) => setNewEvidenceId(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "2px solid #000",
                                    fontFamily: "monospace",
                                    fontSize: "14px"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontFamily: "monospace", fontSize: "14px", display: "block", marginBottom: "5px" }}>
                                {t("laptop.desktop_screen.cases_app.notes")}
                            </label>
                            <textarea
                                value={newEvidenceNotes}
                                onChange={(e) => setNewEvidenceNotes(e.target.value)}
                                rows={3}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "2px solid #000",
                                    fontFamily: "monospace",
                                    fontSize: "14px",
                                    resize: "vertical"
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                            <button
                                onClick={() => setShowAddEvidenceModal(false)}
                                style={{
                                    padding: "10px 20px",
                                    background: "white",
                                    border: "2px solid #000",
                                    cursor: "pointer",
                                    fontFamily: "monospace",
                                    fontSize: "14px"
                                }}
                            >
                                {t("laptop.desktop_screen.cases_app.cancel")}
                            </button>
                            <button
                                onClick={handleAddEvidence}
                                disabled={!newEvidenceId.trim()}
                                style={{
                                    padding: "10px 20px",
                                    background: !newEvidenceId.trim() ? "#ccc" : "#008080",
                                    color: "white",
                                    border: "2px solid #000",
                                    cursor: !newEvidenceId.trim() ? "not-allowed" : "pointer",
                                    fontFamily: "monospace",
                                    fontSize: "14px"
                                }}
                            >
                                {t("laptop.desktop_screen.cases_app.add")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>;
}
